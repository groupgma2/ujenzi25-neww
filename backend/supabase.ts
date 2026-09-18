import { fetchCollection, fetchDocById, insertDoc, insertMessage as insertMsgFirestore } from './firebaseHelpers.js';

// Supabase removed: all DB operations use Firestore helpers now.
export const supabaseAdmin = null as const;

export async function fetchTable(resource: string, opts: { ownerId?: string } = {}) {
  return await fetchCollection(resource, { ownerId: opts.ownerId });
}

export async function fetchRecordById(resource: string, id: string) {
  return await fetchDocById(resource, id);
}

export async function insertRecord(resource: string, record: any) {
  return await insertDoc(resource, record);
}

export async function insertMessage(payload: { sender_id: string; receiver_id?: string | null; content: string; thread_id?: string; context_type?: string; context_id?: string | null }) {
  return await insertMsgFirestore({
    sender_id: payload.sender_id,
    receiver_id: payload.receiver_id ?? null,
    content: payload.content,
    thread_id: payload.thread_id ?? (globalThis.crypto ? crypto.randomUUID() : undefined),
    context_type: payload.context_type ?? null,
    context_id: payload.context_id ?? null,
  });
}

export async function fetchMessagesByThread(threadId: string) {
  const list = await fetchCollection('messages');
  return list.filter((m: any) => m.thread_id === threadId);
}

export async function fetchMessagesByContext(contextType: string, contextId: string) {
  const list = await fetchCollection('messages');
  return list.filter((m: any) => m.context_type === contextType && m.context_id === contextId);
}
