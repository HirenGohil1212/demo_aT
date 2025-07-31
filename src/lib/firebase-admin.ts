
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
            console.error("Firebase Admin initialization error:", error);
        }
    } else {
        console.warn("Firebase Admin SDK not initialized: SERVICE_ACCOUNT_KEY environment variable is not set.");
        // Initialize without credentials if you have other ways of authenticating
        // or for environments where admin features are not used.
        // For many server-side operations, this will not be sufficient.
        admin.initializeApp({ storageBucket });
    }
}

const db = admin.firestore();
const storage = admin.storage();
const auth = admin.auth();

export { db, storage, auth };
