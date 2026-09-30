import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './db.js';

export const EMAIL_TYPES = Object.freeze([
  'welcome',
  'verification',
  'password_reset',
  'contact_received',
  'contact_notification',
  'support_notification',
  'system'
]);

function requireDb() {
  if (!db) throw new Error('Firebase Firestore is not configured yet.');
}

function cleanAddress(value) {
  const address = String(value || '').trim();
  if (!address || /[\r\n]/.test(address)) throw new Error('Invalid recipient email.');
  return address;
}

export async function queueEmail({ to, subject, html, text = '', type = 'system', userId = null, metadata = {} }) {
  requireDb();
  if (!EMAIL_TYPES.includes(type)) throw new Error(`Unsupported email type: ${type}`);
  const recipients = (Array.isArray(to) ? to : [to]).map(cleanAddress);
  if (!recipients.length || !subject) throw new Error('Recipient and subject are required.');

  return addDoc(collection(db, 'mail'), {
    to: recipients,
    message: { subject: String(subject), html: String(html || ''), text: String(text || '') },
    type,
    userId,
    metadata,
    status: 'queued',
    createdAt: serverTimestamp()
  });
}
