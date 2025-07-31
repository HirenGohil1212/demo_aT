
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// This is the recommended approach for handling Firebase Admin initialization
// in a serverless environment like Next.js on Firebase App Hosting.
// It ensures that we only initialize the app once.

const serviceAccountKey = process.env.SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.SERVICE_ACCOUNT_KEY)
    : undefined;

const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

if (!getApps().length) {
    try {
        admin.initializeApp({
            // Use application default credentials if available (recommended for App Hosting)
            // Fall back to service account key for local development
            credential: serviceAccountKey ? admin.credential.cert(serviceAccountKey) : admin.credential.applicationDefault(),
            storageBucket,
        });
        console.log("Firebase Admin SDK initialized successfully.");
    } catch (error: any) {
        console.error("Firebase Admin Initialization Error", error.stack);
    }
}

const db = admin.firestore();
const storage = admin.storage();
const auth = admin.auth();

export { db, storage, auth };
