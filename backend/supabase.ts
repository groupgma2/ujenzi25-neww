import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Diagnostic: log presence (masked) of keys so we can confirm backend sees them without printing secrets
function mask(v?: string) {
  if (!v) return 'MISSING';
  const len = v.length;
  if (len <= 6) return '*'.repeat(len);
  return v.slice(0,3) + '...' + v.slice(-3) + ` (len=${len})`;
}
console.log('Supabase env: VITE_SUPABASE_URL=' + mask(url) + ', SUPABASE_SERVICE_ROLE_KEY=' + (serviceKey ? '(set, len='+serviceKey.length+')' : 'MISSING'));

if (!url || !serviceKey) {
  console.warn('Supabase URL or service role key not configured for backend supabase client. Server-side DB operations will be disabled.');
}

export const supabaseAdmin = (url && serviceKey) ? createClient(url, serviceKey) : null;

export async function fetchTable(resource: string, opts: { ownerId?: string } = {}) {
  if (!supabaseAdmin) throw new Error('Supabase admin client not configured');
  let query = supabaseAdmin.from(resource).select('*');
  if (opts.ownerId) query = query.eq('owner_id', opts.ownerId);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function fetchRecordById(resource: string, id: string) {
  if (!supabaseAdmin) throw new Error('Supabase admin client not configured');
  const { data, error } = await supabaseAdmin.from(resource).select('*').eq('id', id).single();
  if (error) throw error;
  return data ?? null;
}

export async function insertRecord(resource: string, record: any) {
  if (!supabaseAdmin) throw new Error('Supabase admin client not configured');
  const { data, error } = await supabaseAdmin.from(resource).insert(record).select();
  if (error) throw error;
  return (data && data[0]) || null;
}

export async function insertMessage(payload: { sender_id: string; receiver_id?: string | null; content: string; thread_id?: string; context_type?: string; context_id?: string | null }) {
  if (!supabaseAdmin) throw new Error('Supabase admin client not configured');
  const { data, error } = await supabaseAdmin.from('messages').insert({
    sender_id: payload.sender_id,
    receiver_id: payload.receiver_id ?? null,
    content: payload.content,
    thread_id: payload.thread_id ?? (globalThis.crypto ? crypto.randomUUID() : undefined),
    context_type: payload.context_type ?? null,
    context_id: payload.context_id ?? null,
  }).select();
  if (error) throw error;
  return (data && data[0]) || null;
}

export async function fetchMessagesByThread(threadId: string) {
  if (!supabaseAdmin) throw new Error('Supabase admin client not configured');
  const { data, error } = await supabaseAdmin.from('messages').select('*').eq('thread_id', threadId).order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchMessagesByContext(contextType: string, contextId: string) {
  if (!supabaseAdmin) throw new Error('Supabase admin client not configured');
  const { data, error } = await supabaseAdmin.from('messages').select('*').eq('context_type', contextType).eq('context_id', contextId).order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}
