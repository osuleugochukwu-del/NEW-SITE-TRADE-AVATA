import { collection, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { firebaseApp } from './config.js';

export const db = firebaseApp ? getFirestore(firebaseApp) : null;

function requireDb() {
  if (!db) throw new Error('Firebase Firestore is not configured yet.');
}

export async function ensureUserProfile(user) {
  requireDb();
  const ref = doc(db, 'users', user.uid);
  const existing = await getDoc(ref);
  const base = {
    email: user.email || '',
    displayName: user.displayName || '',
    photoURL: user.photoURL || '',
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp()
  };
  if (!existing.exists()) await setDoc(ref, { ...base, createdAt: serverTimestamp() });
  else await updateDoc(ref, base);
  return ref;
}

export async function getUserProfile(uid) {
  requireDb();
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: uid, ...snap.data() } : null;
}

export async function getUserRole(uid) {
  requireDb();
  const snap = await getDoc(doc(db, 'roles', uid));
  return snap.exists() ? { id: uid, ...snap.data() } : null;
}

export async function updateUserProfile(uid, values) {
  requireDb();
  await updateDoc(doc(db, 'users', uid), {
    displayName: values.displayName?.trim() || '',
    photoURL: values.photoURL?.trim() || '',
    updatedAt: serverTimestamp()
  });
}

async function listOwned(collectionName, uid, field = 'userId', max = 25) {
  requireDb();
  const q = query(collection(db, collectionName), where(field, '==', uid), orderBy('createdAt', 'desc'), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map(item => ({ id: item.id, ...item.data() }));
}

export const getUserEntitlements = uid => listOwned('entitlements', uid, 'userId');
export const getUserOrders = uid => listOwned('orders', uid, 'userId');
export const getUserSubscriptions = uid => listOwned('subscriptions', uid, 'userId');
export const getUserEnrollments = uid => listOwned('enrollments', uid, 'userId');
export async function getUserProgress(uid) { return listOwned('progress', uid, 'userId', 100); }
