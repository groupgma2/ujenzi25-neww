import { firestore, bucket } from './firebase.js';
import admin from 'firebase-admin';

if (!firestore) throw new Error('Firestore is not initialized. Set FIREBASE_SERVICE_ACCOUNT_BASE64');

export async function fetchCollection(collection: string, opts: { ownerId?: string } = {}) {
  const q = firestore.collection(collection);
  if (opts.ownerId) q.where('ownerId', '==', opts.ownerId);
  const snap = await q.get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function fetchDocById(collection: string, id: string) {
  const ref = firestore.collection(collection).doc(id);
  const doc = await ref.get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

export async function insertDoc(collection: string, record: any) {
  if (!record.id) {
    const ref = await firestore.collection(collection).add({ ...record, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    const doc = await ref.get();
    return { id: doc.id, ...doc.data() };
  }
  await firestore.collection(collection).doc(record.id).set({ ...record, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
  const doc = await firestore.collection(collection).doc(record.id).get();
  return { id: doc.id, ...doc.data() };
}

export async function uploadBuffer(path: string, buffer: Buffer, contentType?: string) {
  if (!bucket) throw new Error('Storage bucket not configured');
  const file = bucket.file(path);
  await file.save(buffer, { metadata: { contentType } });
  // make public (optional) — production should use signed URLs or proper rules
  try { await file.makePublic(); } catch {}
  return `https://storage.googleapis.com/${bucket.name}/${file.name}`;
}
