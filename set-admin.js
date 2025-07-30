// This script is used to set a custom 'admin' claim on a Firebase user.
// You need to run this script from your command line.
// It requires you to have a service account JSON file for your Firebase project.
// USAGE: node set-admin.js <user_email>

const admin = require('firebase-admin');

// IMPORTANT:
// 1. Download your service account key from Firebase Console:
//    Project settings > Service accounts > Generate new private key
// 2. Save it as 'serviceAccountKey.json' in your project's root directory.
// 3. Make sure this file is listed in your .gitignore to keep it private!
const serviceAccount = require('./serviceAccountKey.json');

// Get the user's email from the command line arguments.
const userEmail = process.argv[2];

if (!userEmail) {
  console.error('Error: Please provide the user\'s email as an argument.');
  console.log('Usage: node set-admin.js <user_email>');
  process.exit(1);
}

// Initialize the Firebase Admin SDK.
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Set the custom claim.
async function setAdminClaim(email) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    if (user.customClaims && user.customClaims.admin === true) {
      console.log(`User ${email} is already an admin.`);
      return;
    }

    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`Success! Custom claim 'admin: true' set for user: ${email}`);
    console.log('The user must log out and log back in for the changes to take effect.');
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
        console.error(`Error: User with email "${email}" not found.`);
        console.error('Please make sure the user exists in Firebase Authentication.');
    } else {
        console.error('Error setting custom claim:', error);
    }
  }
  process.exit(0);
}

setAdminClaim(userEmail);
