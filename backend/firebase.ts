import admin from 'firebase-admin';

let app: admin.app.App | null = null;
let firestore: admin.firestore.Firestore | null = null;
let auth: admin.auth.Auth | null = null;
let bucket: admin.storage.Bucket | null = null;

const keyBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

if (keyBase64) {
  try {
    const decoded = JSON.parse(Buffer.from(keyBase64, 'base64').toString('utf8'));
    app = admin.initializeApp({
      credential: admin.credential.cert(decoded),
      storageBucket: storageBucket || `${decoded.project_id}.appspot.com`,
    });
    firestore = admin.firestore();
    auth = admin.auth();
    bucket = admin.storage().bucket();
    console.log('Firebase admin initialized for project:', decoded.project_id);
  } catch (err) {
    console.warn('Failed to initialize Firebase admin:', err instanceof Error ? err.message : String(err));
  }
} else {
  console.warn('FIREBASE_SERVICE_ACCOUNT_BASE64 not set — Firebase admin disabled');
}

export { app, firestore, auth, bucket };
