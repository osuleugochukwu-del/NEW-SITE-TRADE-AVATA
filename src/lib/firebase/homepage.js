import { collection, doc, getDoc, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from './db.js';

export async function loadHomepageContent() {
  if (!db) return null;
  try {
    const settingsSnap = await getDoc(doc(db, 'siteSettings', 'homepage'));
    const settings = settingsSnap.exists() && settingsSnap.data().public === true ? settingsSnap.data() : {};

    const indicatorQuery = query(collection(db, 'homepageIndicators'), where('public', '==', true), limit(8));
    const indicatorSnap = await getDocs(indicatorQuery);
    const indicators = indicatorSnap.docs.map(item => ({ id: item.id, ...item.data() })).sort((a,b)=>(a.order||0)-(b.order||0));

    return {
      hero: settings.hero || {},
      ai: settings.ai || {},
      featured: settings.featured || {},
      cta: settings.cta || {},
      indicators
    };
  } catch {
    return null;
  }
}
