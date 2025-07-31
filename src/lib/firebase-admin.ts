
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

const serviceAccount = process.env.SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.SERVICE_ACCOUNT_KEY)
  : undefined;

const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

if (!getApps().length) {
    if (!serviceAccount) {
        console.warn("SERVICE_ACCOUNT_KEY environment variable is not set. Admin features will be disabled.");
    } else {
         admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket,
        });
    }
}

const db = admin.firestore();
const storage = admin.storage();
const auth = admin.auth();

export { db, storage, auth };
