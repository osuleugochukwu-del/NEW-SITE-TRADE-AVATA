import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './db.js';

function requireAdminDb() { if (!db) throw new Error('Firebase is not configured yet.'); }

export async function getAdminRole(uid) {
  requireAdminDb();
  const snap = await getDoc(doc(db, 'roles', uid));
  const data = snap.exists() ? snap.data() : null;
  return data && ['admin','staff','superAdmin'].includes(data.role) ? { id: uid, ...data } : null;
}

export async function listAdminCollection(name, max = 100) {
  requireAdminDb();
  try {
    const snap = await getDocs(query(collection(db, name), orderBy('createdAt','desc'), limit(max)));
    return snap.docs.map(item => ({ id: item.id, ...item.data() }));
  } catch {
    const snap = await getDocs(query(collection(db, name), limit(max)));
    return snap.docs.map(item => ({ id: item.id, ...item.data() }));
  }
}

export async function listAdminSubcollection(path, max = 100) {
  requireAdminDb();
  const parts = String(path).split('/').filter(Boolean);
  const snap = await getDocs(query(collection(db, ...parts), limit(max)));
  return snap.docs.map(item => ({ id: item.id, ...item.data() }));
}

export async function saveAdminDocument(name, id, values) {
  requireAdminDb();
  const ref = id ? doc(db, name, id) : doc(collection(db, name));
  await setDoc(ref, { ...values, updatedAt: serverTimestamp(), ...(id ? {} : { createdAt: serverTimestamp() }) }, { merge: true });
  return ref.id;
}

export async function removeAdminDocument(name, id) { requireAdminDb(); await deleteDoc(doc(db, name, id)); }

export async function setRole(uid, role, permissions = []) {
  requireAdminDb();
  await setDoc(doc(db, 'roles', uid), { role, permissions, updatedAt: serverTimestamp() }, { merge: true });
}

export async function saveAdminPathDocument(path, id, values) {
  requireAdminDb();
  const parts = String(path).split('/').filter(Boolean);
  if (!parts.length) throw new Error('Invalid Firestore path.');
  const ref = id ? doc(db, ...parts, id) : doc(collection(db, ...parts));
  await setDoc(ref, { ...values, updatedAt: serverTimestamp(), ...(id ? {} : { createdAt: serverTimestamp() }) }, { merge: true });
  return ref.id;
}

export async function removeAdminPathDocument(path, id) {
  requireAdminDb();
  const parts = String(path).split('/').filter(Boolean);
  await deleteDoc(doc(db, ...parts, id));
}

export async function writeAdminAudit({ actorId, action, target, targetId = '', metadata = {} }) {
  requireAdminDb();
  await addDoc(collection(db, 'auditLogs'), { actorId, action, target, targetId, metadata, createdAt: serverTimestamp() });
}

export async function createAnnouncement(values) {
  requireAdminDb();
  return addDoc(collection(db, 'announcements'), { ...values, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}
