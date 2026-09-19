import admin from 'firebase-admin';

let app: admin.app.App | null = null;
let firestore: admin.firestore.Firestore | null = null;
let auth: admin.auth.Auth | null = null;
let bucket: admin.storage.Bucket | null = null;

// Support two ways to provide service account:
// 1) FIREBASE_SERVICE_ACCOUNT_BASE64  -> base64 encoded JSON
// 2) FIREBASE_SERVICE_ACCOUNT_JSON    -> raw JSON (used with Secret Manager)
const keyBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
const keyJsonRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

function tryInitWithObject(obj: any) {
  try {
    app = admin.initializeApp({
      credential: admin.credential.cert(obj),
      storageBucket: storageBucket || `${obj.project_id}.appspot.com`,
    });
    firestore = admin.firestore();
    auth = admin.auth();
    bucket = admin.storage().bucket();
    console.log('Firebase admin initialized for project:', obj.project_id);
    return true;
  } catch (err) {
    console.warn('Failed to initialize Firebase admin from object:', err instanceof Error ? err.message : String(err));
    return false;
  }
}

if (keyJsonRaw) {
  try {
    const parsed = JSON.parse(keyJsonRaw);
    if (!tryInitWithObject(parsed)) {
      console.warn('Failed to init Firebase from FIREBASE_SERVICE_ACCOUNT_JSON');
    }
  } catch (err) {
    console.warn('FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON');
  }
} else if (keyBase64) {
  try {
    const decoded = JSON.parse(Buffer.from(keyBase64, 'base64').toString('utf8'));
    if (!tryInitWithObject(decoded)) {
      console.warn('Failed to init Firebase from FIREBASE_SERVICE_ACCOUNT_BASE64');
    }
  } catch (err) {
    console.warn('Failed to initialize Firebase admin from base64:', err instanceof Error ? err.message : String(err));
  }
} else {
  console.warn('No Firebase service account provided — set FIREBASE_SERVICE_ACCOUNT_JSON (recommended) or FIREBASE_SERVICE_ACCOUNT_BASE64');
}

export { app, firestore, auth, bucket };
