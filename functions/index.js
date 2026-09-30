import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onUserCreated } from 'firebase-functions/v2/identity';
import { onRequest } from 'firebase-functions/v2/https';
import { sendEmail } from './email/service.js';
import { renderEmailTemplate } from './email/templates.js';
import { getEmailConfig } from './email/config.js';

initializeApp();
const db = getFirestore();
const auth = getAuth();

async function runtimeEmailConfig() {
  const snap = await db.collection('siteSettings').doc('email').get();
  return snap.exists ? snap.data() || {} : {};
}

async function logEmail({ mailId = null, type = 'system', to, subject, status, provider, dryRun = false, error = null }) {
  await db.collection('emailLogs').add({
    mailId, type, recipientCount: Array.isArray(to) ? to.length : 1,
    subject: String(subject || '').slice(0, 200), status, provider, dryRun,
    ...(error ? { error: String(error).slice(0, 500) } : {}), createdAt: Timestamp.now()
  });
}

export const processEmailQueue = onDocumentCreated('mail/{mailId}', async event => {
  const snapshot = event.data;
  if (!snapshot) return;
  const data = snapshot.data() || {};
  const ref = snapshot.ref;
  try {
    await ref.set({ status: 'processing', processingStartedAt: Timestamp.now() }, { merge: true });
    const message = data.message || {};
    const result = await sendEmail({ to: data.to, subject: message.subject || '', html: message.html || '', text: message.text || '', configOverrides: await runtimeEmailConfig() });
    await ref.set({ status: result.status, provider: result.provider, dryRun: Boolean(result.dryRun), messageId: result.messageId || null, processedAt: Timestamp.now() }, { merge: true });
    await logEmail({ mailId: ref.id, type: data.type || 'system', to: data.to, subject: message.subject, status: result.status, provider: result.provider, dryRun: Boolean(result.dryRun) });
  } catch (error) {
    const message = String(error?.message || error).slice(0, 500);
    await ref.set({ status: 'failed', error: message, failedAt: Timestamp.now() }, { merge: true });
    await logEmail({ mailId: ref.id, type: data.type || 'system', to: data.to, subject: data.message?.subject, status: 'failed', provider: 'unknown', error: message });
  }
});

export const welcomeEmailOnUserCreated = onUserCreated(async user => {
  if (!user.email) return;
  const config = await runtimeEmailConfig();
  const appUrl = String(config.appUrl || process.env.APP_URL || 'http://localhost:4321').replace(/\/$/, '');
  const html = renderEmailTemplate('welcome', { name: user.displayName || 'Trader', message: 'Your Trade Avata account is ready.', actionUrl: `${appUrl}/`, actionLabel: 'Open Trade Avata' });
  const result = await sendEmail({ to: user.email, subject: 'Welcome to Trade Avata', html, text: 'Welcome to Trade Avata. Your account is ready.', configOverrides: config });
  await logEmail({ type: 'welcome', to: user.email, subject: 'Welcome to Trade Avata', status: result.status, provider: result.provider, dryRun: Boolean(result.dryRun) });
});

export const contactMessageEvents = onDocumentCreated('contactMessages/{messageId}', async event => {
  const data = event.data?.data();
  if (!data) return;
  const config = await runtimeEmailConfig();
  const recipient = config.adminEmail || config.supportEmail;
  if (!recipient) return;
  const html = renderEmailTemplate('contact_notification', { title: `New contact message: ${data.subject || 'Contact'}`, name: data.name, message: `${data.email}

${data.message}` });
  const result = await sendEmail({ to: recipient, subject: `[Trade Avata Contact] ${String(data.subject || 'New message').slice(0, 120)}`, html, text: `${data.name} <${data.email}>

${data.message}`, replyTo: data.email, configOverrides: config });
  await db.collection('contactMessages').doc(event.params.messageId).set({ notificationStatus: result.status, notificationProvider: result.provider, notifiedAt: Timestamp.now() }, { merge: true });
  await logEmail({ type: 'contact_notification', to: recipient, subject: `[Trade Avata Contact] ${String(data.subject || 'New message').slice(0, 120)}`, status: result.status, provider: result.provider, dryRun: Boolean(result.dryRun) });
});

export const supportMessageEvents = onDocumentCreated('supportConversations/{conversationId}/messages/{messageId}', async event => {
  const message = event.data?.data();
  if (!message) return;
  const conversationId = event.params.conversationId;
  const conversation = await db.collection('supportConversations').doc(conversationId).get();
  if (!conversation.exists) return;
  const conversationData = conversation.data() || {};
  const roles = await db.collection('roles').where('role', 'in', ['admin', 'staff']).get();
  const batch = db.batch();
  for (const role of roles.docs) {
    if (message.senderType === 'visitor') {
      batch.set(db.collection('notifications').doc(), { userId: role.id, type: 'support_message', title: 'New support message', message: String(message.message || '').slice(0, 180), conversationId, read: false, createdAt: Timestamp.now() });
    }
  }
  if (message.senderType === 'admin') {
    batch.set(db.collection('auditLogs').doc(), { actorId: message.senderUid, action: 'support_reply', target: 'supportConversation', targetId: conversationId, metadata: { messageId: event.params.messageId, visitorUid: conversationData.visitorUid }, createdAt: Timestamp.now() });
  }
  await batch.commit();
  const config = await runtimeEmailConfig();
  const recipient = config.adminEmail || config.supportEmail;
  if (recipient && message.senderType === 'visitor') {
    const html = renderEmailTemplate('support_notification', { title: 'New support message', name: 'Support visitor', message: String(message.message || '') });
    const result = await sendEmail({ to: recipient, subject: '[Trade Avata Support] New support message', html, text: String(message.message || ''), configOverrides: config });
    await logEmail({ type: 'support_notification', to: recipient, subject: '[Trade Avata Support] New support message', status: result.status, provider: result.provider, dryRun: Boolean(result.dryRun) });
  }
});

export const purgeResolvedSupportConversations = onSchedule('every 24 hours', async () => {
  const setting = await db.collection('siteSettings').doc('global').get();
  const retentionDays = Math.max(1, Number(setting.data()?.supportRetentionDays || 7));
  const cutoff = Timestamp.fromMillis(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  const snap = await db.collection('supportConversations').where('status', '==', 'resolved').where('resolvedAt', '<=', cutoff).limit(100).get();
  for (const conversation of snap.docs) {
    const messages = await conversation.ref.collection('messages').get();
    let batch = db.batch(); let count = 0;
    for (const message of messages.docs) { batch.delete(message.ref); count += 1; if (count === 450) { await batch.commit(); batch = db.batch(); count = 0; } }
    batch.delete(conversation.ref); await batch.commit();
  }
});


function aiCors(res) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
}

export const reviewJournal = onRequest({ timeoutSeconds: 60, memory: '256MiB' }, async (req, res) => {
  aiCors(res);
  if (req.method === 'OPTIONS') return res.status(204).send('');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });

  try {
    const bearer = String(req.get('authorization') || '');
    if (!bearer.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required.' });
    await auth.verifyIdToken(bearer.slice(7));

    const evidence = req.body?.evidence;
    if (!evidence || typeof evidence !== 'object') return res.status(400).json({ error: 'Journal evidence is required.' });

    const apiKey = process.env.TRADE_AVATA_AI_API_KEY || '';
    const apiUrl = process.env.TRADE_AVATA_AI_API_URL || 'https://api.openai.com/v1/chat/completions';
    const model = process.env.TRADE_AVATA_AI_MODEL || 'gpt-4o-mini';
    if (!apiKey) return res.status(503).json({ error: 'AI provider is not configured yet.' });

    const system = [
      'You are Trade Avata AI Journal Review.',
      'Analyze trading-journal evidence only; never invent missing facts.',
      'Do not give financial advice, trade signals, price predictions, or promises.',
      'Separate recorded facts from interpretation.',
      'If a field is missing, say it is missing.',
      'Return concise HTML-safe plain text with these headings: Summary, Evidence, Plan vs Execution, Missing Evidence, Lesson, Next Review Focus.',
      'Use the trader\'s recorded strategy and notes as the source of truth.'
    ].join(' ');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: `Review this journal evidence:
${JSON.stringify(evidence, null, 2)}` }
        ]
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(502).json({ error: 'AI provider request failed.', provider: data?.error?.message || 'Unknown provider error' });
    const report = data?.choices?.[0]?.message?.content || '';
    if (!report) return res.status(502).json({ error: 'AI provider returned no review.' });
    return res.status(200).json({ report });
  } catch (error) {
    return res.status(500).json({ error: String(error?.message || error).slice(0, 500) });
  }
});
