import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './db.js';

const COLLECTION = 'analyticsPreferences';

export async function getAnalyticsPreferences(uid) {
  if (!db || !uid) return null;
  try {
    const snap = await getDoc(doc(db, COLLECTION, uid));
    return snap.exists() ? snap.data() : null;
  } catch {
    return null;
  }
}

export async function saveAnalyticsPreferences(uid, preferences = {}) {
  if (!db || !uid) return null;
  const allowed = {
    density: preferences.density, chartHeight: preferences.chartHeight, chartTheme: preferences.chartTheme,
    accent: preferences.accent, header: preferences.header, background: preferences.background, panel: preferences.panel,
    hidden: Array.isArray(preferences.hidden) ? preferences.hidden : [],
    widgetOrder: Array.isArray(preferences.widgetOrder) ? preferences.widgetOrder : []
  };
  Object.keys(allowed).forEach(key => { if (allowed[key] === undefined) delete allowed[key]; });
  await setDoc(doc(db, COLLECTION, uid), { ...allowed, updatedAt: serverTimestamp() }, { merge: true });
  return allowed;
}
