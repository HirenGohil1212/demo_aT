
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

const serviceAccountKey = process.env.SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.SERVICE_ACCOUNT_KEY)
    : undefined;

const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

if (!getApps().length) {
    if (serviceAccountKey) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccountKey),
                storageBucket,
            });
        } catch (error) {
            console.error("Firebase Admin initialization error with service account:", error);
        }
    } else {
        // Use application default credentials if service account key is not provided
        // This is the standard for App Hosting and other Google Cloud environments
        try {
             admin.initializeApp({
                storageBucket,
            });
        } catch(error) {
             console.error("Firebase Admin initialization error with default credentials:", error);
        }
    }
}

const db = admin.firestore();
const storage = admin.storage();
const auth = admin.auth();

export { db, storage, auth };
