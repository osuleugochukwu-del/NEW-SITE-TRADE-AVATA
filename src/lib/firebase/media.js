import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { firebaseApp } from './config.js';

export async function uploadHomepageImage(file, slot) {
  if (!firebaseApp) throw new Error('Firebase is not configured yet.');
  if (!file) throw new Error('Choose an image first.');
  const maxBytes = 5 * 1024 * 1024;
  if (file.size > maxBytes) throw new Error('Image is larger than the 5 MB storage limit.');
  if (!file.type.startsWith('image/')) throw new Error('Only image files are allowed.');
  const storage = getStorage(firebaseApp);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
  const path = `public/homepage/${slot}/${Date.now()}-${safeName}`;
  const snapshot = await uploadBytes(ref(storage, path), file, { contentType: file.type, cacheControl: 'public,max-age=31536000,immutable' });
  return getDownloadURL(snapshot.ref);
}
