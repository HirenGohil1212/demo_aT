
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

let app: admin.app.App;

if (getApps().length === 0) {
  try {
    if (!process.env.SERVICE_ACCOUNT_KEY) {
        throw new Error("SERVICE_ACCOUNT_KEY environment variable is not set.");
    }
    const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);

    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: `${serviceAccount.project_id}.appspot.com`,
    });
    console.log("Firebase Admin SDK initialized successfully.");
  } catch (error: any) {
    console.error("Firebase Admin Initialization Error", error.stack);
    // Throw an error to prevent the app from continuing with a misconfigured admin SDK
    throw new Error("Failed to initialize Firebase Admin SDK.");
  }
} else {
  app = admin.app();
}

const db = admin.firestore(app);
const storage = admin.storage(app);
const auth = admin.auth(app);

export { db, storage, auth };
