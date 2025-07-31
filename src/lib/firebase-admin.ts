
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

let db: admin.firestore.Firestore;
let storage: admin.storage.Storage;
let auth: admin.auth.Auth;

try {
  const serviceAccount = process.env.SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.SERVICE_ACCOUNT_KEY)
    : undefined;

  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  if (!getApps().length) {
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket,
      });
    } else {
      console.warn("Firebase Admin SDK not initialized: SERVICE_ACCOUNT_KEY is missing.");
    }
  }

  // Only assign these if the app has been initialized
  if (getApps().length > 0) {
    db = admin.firestore();
    storage = admin.storage();
    auth = admin.auth();
  } else {
    // Provide a safe fallback if initialization failed
    // This will prevent crashes but features will not work.
    // Errors will be logged where these are used.
    db = {} as admin.firestore.Firestore;
    storage = {} as admin.storage.Storage;
    auth = {} as admin.auth.Auth;
  }

} catch (error) {
  console.error("Failed to initialize Firebase Admin SDK:", error);
  // Provide safe fallbacks on error
  db = {} as admin.firestore.Firestore;
  storage = {} as admin.storage.Storage;
  auth = {} as admin.auth.Auth;
}


export { db, storage, auth };
