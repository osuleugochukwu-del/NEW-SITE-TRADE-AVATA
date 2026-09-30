import nodemailer from 'nodemailer';
import { getEmailConfig } from './config.js';

function normalizeRecipients(to) { return (Array.isArray(to) ? to : [to]).map(value => String(value || '').trim()).filter(Boolean); }
function assertSafe(value, label) { if (!value || /[\r\n]/.test(String(value))) throw new Error(`Invalid ${label}.`); }

export async function sendEmail({ to, subject, html, text = '', replyTo = '', configOverrides = {} }) {
  const config = getEmailConfig(configOverrides);
  const recipients = normalizeRecipients(to);
  if (!recipients.length) throw new Error('At least one recipient is required.');
  recipients.forEach(value => assertSafe(value, 'recipient'));
  assertSafe(subject, 'subject');
  if (config.fromEmail) assertSafe(config.fromEmail, 'sender');
  if (replyTo || config.replyTo) assertSafe(replyTo || config.replyTo, 'reply-to address');

  const base = {
    to: recipients.join(', '),
    from: config.fromEmail ? `${config.fromName} <${config.fromEmail}>` : config.fromName,
    subject: String(subject || ''),
    html: String(html || ''),
    text: String(text || ''),
    ...(replyTo || config.replyTo ? { replyTo: replyTo || config.replyTo } : {})
  };

  if (!config.enabled || config.dryRun || config.provider === 'none') {
    console.info('[Trade Avata email dry-run]', JSON.stringify({ provider: config.provider, to: recipients, subject: base.subject }));
    return { status: 'queued', provider: 'none', dryRun: true, messageId: null };
  }

  if (config.provider === 'smtp') {
    if (!config.smtpHost || !config.smtpUser || !config.smtpPassword || !config.fromEmail) throw new Error('SMTP email provider is not configured.');
    const transporter = nodemailer.createTransport({ host: config.smtpHost, port: config.smtpPort, secure: config.smtpSecure, auth: { user: config.smtpUser, pass: config.smtpPassword } });
    const result = await transporter.sendMail(base);
    return { status: 'sent', provider: 'smtp', dryRun: false, messageId: result.messageId || null };
  }

  if (config.provider === 'resend') {
    if (!config.resendApiKey || !config.fromEmail) throw new Error('Resend email provider is not configured.');
    const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { authorization: `Bearer ${config.resendApiKey}`, 'content-type': 'application/json' }, body: JSON.stringify({ from: base.from, to: recipients, subject: base.subject, html: base.html, text: base.text, ...(base.replyTo ? { reply_to: base.replyTo } : {}) }) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.message || `Resend request failed with ${response.status}.`);
    return { status: 'sent', provider: 'resend', dryRun: false, messageId: payload.id || null };
  }
  throw new Error(`Unsupported email provider: ${config.provider}`);
}
