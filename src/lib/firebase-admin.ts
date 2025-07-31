
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// This file is sensitive and should not be exposed to the client.
// It uses a service account to gain admin access to your Firebase project.
// You must create a serviceAccountKey.json file in the root of your project.
// To get your service account key, go to your Firebase project settings,
// then to the "Service accounts" tab, and click "Generate new private key".
// Important: Add serviceAccountKey.json to your .gitignore file to prevent it
// from being checked into source control!
import serviceAccount from '../../serviceAccountKey.json';

// Define the shape of your service account key for type safety
interface ServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain: string;
}

let app: admin.app.App;

if (getApps().length === 0) {
  try {
    app = admin.initializeApp({
      // We cast the imported JSON to the ServiceAccount type
      credential: admin.credential.cert(serviceAccount as ServiceAccount),
      storageBucket: "fir-5d78f.firebasestorage.app",
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
