import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { auth } from './auth.js';
import { db } from './db.js';

function requireSupportFirebase() {
  if (!auth || !db) throw new Error('Firebase support is not configured yet.');
}

export async function ensureSupportVisitor() {
  requireSupportFirebase();
  if (!auth.currentUser) await signInAnonymously(auth);
  return auth.currentUser;
}

export async function createSupportConversation(visitorUid, firstMessage) {
  requireSupportFirebase();
  const ref = await addDoc(collection(db, 'supportConversations'), {
    visitorUid,
    status: 'open',
    unreadForAdmin: true,
    unreadForVisitor: false,
    lastMessage: firstMessage,
    lastMessageAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  await addDoc(collection(db, 'supportConversations', ref.id, 'messages'), {
    senderType: 'visitor',
    senderUid: visitorUid,
    message: firstMessage,
    createdAt: serverTimestamp()
  });
  return ref.id;
}

export async function sendSupportMessage(conversationId, senderType, senderUid, message) {
  requireSupportFirebase();
  const clean = String(message || '').trim();
  if (!clean) return;
  await addDoc(collection(db, 'supportConversations', conversationId, 'messages'), {
    senderType,
    senderUid,
    message: clean,
    createdAt: serverTimestamp()
  });
  await updateDoc(doc(db, 'supportConversations', conversationId), {
    lastMessage: clean,
    lastMessageAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    unreadForAdmin: senderType === 'visitor',
    unreadForVisitor: senderType === 'admin'
  });
}

export function watchSupportMessages(conversationId, callback) {
  requireSupportFirebase();
  const q = query(collection(db, 'supportConversations', conversationId, 'messages'), orderBy('createdAt', 'asc'));
  return onSnapshot(q, snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

export async function getSupportConversation(visitorUid) {
  requireSupportFirebase();
  const q = query(collection(db, 'supportConversations'), where('visitorUid', '==', visitorUid), orderBy('updatedAt', 'desc'), limit(1));
  const snap = await getDocs(q);
  return snap.docs[0] ? { id: snap.docs[0].id, ...snap.docs[0].data() } : null;
}

export async function listSupportConversations(max = 100) {
  requireSupportFirebase();
  const q = query(collection(db, 'supportConversations'), orderBy('updatedAt', 'desc'), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function markSupportRead(conversationId, field = 'unreadForAdmin') {
  requireSupportFirebase();
  await updateDoc(doc(db, 'supportConversations', conversationId), { [field]: false, updatedAt: serverTimestamp() });
}

export async function resolveSupportConversation(conversationId, actorUid) {
  requireSupportFirebase();
  await updateDoc(doc(db, 'supportConversations', conversationId), { status: 'resolved', resolvedBy: actorUid, resolvedAt: serverTimestamp(), unreadForAdmin: false, updatedAt: serverTimestamp() });
}
