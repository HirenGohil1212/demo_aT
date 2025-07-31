
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

const serviceAccountKey = process.env.SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.SERVICE_ACCOUNT_KEY)
    : undefined;

const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

// This pattern ensures we only initialize the app once, which is crucial for serverless environments
if (!getApps().length) {
    try {
        admin.initializeApp({
            // Use application default credentials if available (recommended for App Hosting)
            // Fall back to service account key for local development
            credential: serviceAccountKey ? admin.credential.cert(serviceAccountKey) : admin.credential.applicationDefault(),
            storageBucket,
        });
    } catch (error: any) {
        console.error("Firebase Admin Initialization Error", error.stack);
    }
}

const db = admin.firestore();
const storage = admin.storage();
const auth = admin.auth();

export { db, storage, auth };
