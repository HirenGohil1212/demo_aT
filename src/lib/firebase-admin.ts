
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

const serviceAccount = process.env.SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.SERVICE_ACCOUNT_KEY)
  : {
      type: 'service_account',
      project_id: 'fir-5d78f',
      private_key_id: 'eec002333db7fdf0e51414f1db644e5afaa4d544',
      private_key: process.env.SERVICE_ACCOUNT_PRIVATE_KEY || `-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCNWGTJybkVjBOA\noCiF6RuhqqVXS19x3FVVT8JNUE/kYVAHrsXI1ZxBNUoOr0UuLW4JvitIabiEUmQd\nGnY7gws31lDi4QoLP+piSL9ZklT1c6kaOXsRdk/4QAVXcYYArOBhwJD5HiJ96uEv\npfea8EGeAoXPyng+ehz/mAuHosvTezb8oSko62vYVE8EitRlwr2wQb2R8/p1L+NS\neL7t21czleD/0l4OZLnR243WyZ5xir3Yxn0YlKuCuYTCLqspdWPhLFQZHeL9YWpC\niINg1Y4PZ9+JCvn/h5KLixqJA8m/7B3wUa2vQ6fh5etQe4QruPL6Sxb/zKEgCNfS\nlcH3BPJNAgMBAAECggEAFKzGl16eqFh0PNcQfl/15vypUT7I8AR45fDz/K+f9AnI\n9Uq7CxC12bL0CXhZP/MsupeayK2QLCjKFJi7jSJyuGDstXcR60nW3LgD51P4gevA\nY0HfrtL1yRwCPANyxLQE4T+T5SCjjnQWKsxVzs/QZU68qIOW+ZqOldN1ckpdkqom\nXb6oN0/05Nv5GIPgB5O/bpLAB82lAYv+Y+3moNPa5IaZU5dXFu2CYTMcM1iJThwX\n+ntlKZbeNn9YB6wxLTDFoFn0U4oNAzs2nK4LKweDTjGp0Y35hgtznl/qPRizZ3m4\nbsP1jvc50eDznN06EPdnGLMoUO9EaDlojMmFC4jYWQKBgQDBLeeNRQ4FuFf1ByNO\nIy9sLSjqVaQWmQKefXvccasQoy5kHIlJVRFikO2/e6yvB6TjvgZQQWzuylEq58z4\n5Vpfghmh0FGLMIU5FBLAbF0fxe6keuRoC71F/m4k1mThvM60IW9B/T1ORBo+0n2b\nlH5N4B9l7F6fYDNUmmhBHJZ1dQKBgQC7T1Qf6Bs3HajHmbqkbmQM6yr35meEAtGg\nPrYkUDS+KkxYozPb7A46GzcWR7Sg4ksCAZyDeLuFUxgmEmA7SsbGTkzZKrmfFpD7\nXgRuEJRGbKUPToqvTOzbhUfwM/Dezr/5qvuKlpx9puGh1BYJznZcs9Slh72hu2fr\n8AM1DMX2eQKBgQCBvkL2LprsXJM2jkS4BgmjrfD88efzBXEs4Tp/JBiwY+iUdFYA\nWpICkTQclwOzyn6ENuwmmsp+1oMNPgH8aI3593cfprodscjIPSMa+azR2i4daixd\ndQT6LZfsRdIbiqOJd6sxttOl7TdzWgvioijyRMTRv58Ni57uA4ZhtMGYwQKBgBA2\nwLh2VgzCU37brs1XBPAdVz3YQvOpbs3pP8kK7FXdwXgWwIF0AJNFEdKq6FbY39dP\nnmW/CLR0ye1Zv9zCD0zRMFPIIANGZ8xqigWhB8TE2NDnYpfkF8i009JWHK6cxP9u\nrpGDkg5KaNOiUToOFi7WHj0p799VIpzIzO5Fqck5AoGAYxcPNCmMaG2v2aJ6h7dT\nV6WnLf5qGgP1Orbv9e3umYJlbhsh8hMGfhdRa5BuImfZsVQOsdZp6oDXlhaqzBb9\nkxNYweiwNHghnrugknPPNbF5yrBVnJaXkH0DiIwzpckdEF2tXLvka8RmzfklSHug\nsVMGwLlHWpjhbqEKE0N1m5c=\n-----END PRIVATE KEY-----\n`.replace(/\\n/g, '\n'),
      client_email: 'firebase-adminsdk-fbsvc@fir-5d78f.iam.gserviceaccount.com',
      client_id: '114502616952635288843',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40fir-5d78f.iam.gserviceaccount.com',
      universe_domain: 'googleapis.com',
    };

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
