
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// This is the correct way to initialize the admin SDK.
// It uses a simplified service account object and ensures the storageBucket is always correct.
const serviceAccount = process.env.SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.SERVICE_ACCOUNT_KEY)
  : {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID || 'fir-5d78f',
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
      universe_domain: 'googleapis.com',
    };

// The storage bucket must be in the format 'project-id.appspot.com' for the Admin SDK.
const storageBucket = "fir-5d78f.appspot.com";

if (!getApps().length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: storageBucket,
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
