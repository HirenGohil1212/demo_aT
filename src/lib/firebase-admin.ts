
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

const serviceAccount = process.env.SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.SERVICE_ACCOUNT_KEY)
  : require('../../serviceAccountKey.json');

const storageBucket = 'fir-5d78f.appspot.com';

if (!getApps().length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket,
  });
}

const db = admin.firestore();
const storage = admin.storage();
const auth = admin.auth();

export { db, storage, auth };
