import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

// 🔹 Replace with your Firebase project config
const FIREBASE_CONFIG = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.appId,
};

// ✅ Initialize Firebase App
const app = initializeApp(FIREBASE_CONFIG);

// ✅ Auth setup
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// ✅ Firestore with persistence (new way)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(), // supports multi-tab
  }),
});
