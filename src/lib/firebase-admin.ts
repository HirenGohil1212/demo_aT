
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

const serviceAccountKey = process.env.SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.SERVICE_ACCOUNT_KEY)
    : undefined;

const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

if (!getApps().length) {
    try {
        if (serviceAccountKey) {
            // Initialize with service account key
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccountKey),
                storageBucket,
            });
        } else {
            // Initialize with application default credentials for App Hosting
            admin.initializeApp({
                storageBucket,
            });
        }
    } catch (error: any) {
        console.error("Firebase Admin Initialization Error", error.stack);
    }
}

const db = admin.firestore();
const storage = admin.storage();
const auth = admin.auth();

export { db, storage, auth };
