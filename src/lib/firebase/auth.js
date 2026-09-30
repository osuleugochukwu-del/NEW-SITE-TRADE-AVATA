import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { firebaseApp } from './config.js';

export const auth = firebaseApp ? getAuth(firebaseApp) : null;

export function watchAuth(callback) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export { onAuthStateChanged };
