import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore, doc, getDocFromServer, setLogLevel } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseAppletConfig from '../../firebase-applet-config.json';

// Silence internal retry connection warning in sandboxes and dev iframes
setLogLevel('error');

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseAppletConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseAppletConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseAppletConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseAppletConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseAppletConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseAppletConfig.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || firebaseAppletConfig.measurementId || '',
};

export const ADMIN_CONFIG = {
  uid: import.meta.env.VITE_ADMIN_UID || 'b2VxSCaUAkOO8g5UwSGIPtpzD4A2',
  email: import.meta.env.VITE_ADMIN_EMAIL || 'mdsakoyatali0852369@gmail.com',
  adminEmails: ['mdsakoyatali0852369@gmail.com', 'btsarmy@lovers.bd'],
  adminUids: ['b2VxSCaUAkOO8g5UwSGIPtpzD4A2', 'uIk8z325rGNlW3gj9M422JVIPwj1'],
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
try {
  initializeFirestore(app, { ignoreUndefinedProperties: true }, firebaseAppletConfig.firestoreDatabaseId);
} catch {
  // Instance already initialized
}
export const db = getFirestore(app, firebaseAppletConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const storage = getStorage(app);

// Connection test helper per firebase skill
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore client is offline or connecting...');
    }
  }
}
testConnection();
