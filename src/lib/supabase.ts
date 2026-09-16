import { createClient, type User as SupabaseUser } from '@supabase/supabase-js';
import type { User, UserRole } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function mapSupabaseUser(user: SupabaseUser | null): User | null {
  if (!user) return null;

  const meta = user.user_metadata ?? {};
  const roleValue = (meta.role ?? meta.user_role ?? 'client') as UserRole;
  const safeRole: UserRole = ['client', 'company', 'partner', 'admin'].includes(roleValue) ? roleValue : 'client';

  return {
    id: user.id,
    email: user.email ?? '',
    phone: typeof meta.phone === 'string' ? meta.phone : undefined,
    fullName: typeof meta.full_name === 'string' && meta.full_name
      ? meta.full_name
      : typeof meta.fullName === 'string' && meta.fullName
        ? meta.fullName
        : (user.email ? user.email.split('@')[0] : 'User'),
    avatar: typeof meta.avatar_url === 'string' ? meta.avatar_url : undefined,
    role: safeRole,
    isVerified: Boolean(user.email_confirmed_at),
    createdAt: user.created_at ?? new Date().toISOString(),
    updatedAt: user.updated_at ?? user.created_at ?? new Date().toISOString(),
  };
}

export async function ensureSupabaseClient() {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.'
    );
  }

  return supabase;
}

export async function signUpWithSupabase(input: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: 'client' | 'company' | 'partner' | 'admin';
}) {
  const client = await ensureSupabaseClient();

  const { data, error } = await client.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName,
        phone: input.phone ?? '',
        role: input.role ?? 'client',
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function signInWithSupabase(email: string, password: string) {
  const client = await ensureSupabaseClient();

  const { data, error } = await client.auth.signInWithPassword({ email, password });

  if (error) throw error;
  return data;
}

export async function signOutFromSupabase() {
  const client = await ensureSupabaseClient();
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

export async function getCurrentSupabaseUser() {
  const client = await ensureSupabaseClient();
  const { data, error } = await client.auth.getUser();
  if (error) throw error;
  return data.user;
}

export async function getMessagesForThread(threadId: string) {
  const client = await ensureSupabaseClient();

  const { data, error } = await client
    .from('messages')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function sendMessageToSupabase(input: {
  sender_id: string;
  receiver_id: string | null;
  content: string;
  thread_id?: string;
  context_type?: string;
  context_id?: string | null;
}) {
  const client = await ensureSupabaseClient();

  const { data, error } = await client
    .from('messages')
    .insert({
      sender_id: input.sender_id,
      receiver_id: input.receiver_id,
      content: input.content,
      thread_id: input.thread_id ?? crypto.randomUUID(),
      context_type: input.context_type ?? 'property',
      context_id: input.context_id ?? null,
    })
    .select();

  if (error) throw error;
  return data?.[0] ?? null;
}

export async function fetchSupabaseTable<T>(table: string) {
  const client = await ensureSupabaseClient();

  const { data, error } = await client.from(table).select('*');
  if (error) throw error;
  return data as T[];
}

export async function fetchSupabaseProperties() {
  const client = await ensureSupabaseClient();
  const { data, error } = await client
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function fetchSupabaseRentals() {
  const client = await ensureSupabaseClient();
  const { data, error } = await client
    .from('rentals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function fetchSupabaseHotels() {
  const client = await ensureSupabaseClient();
  const { data, error } = await client
    .from('hotels')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function fetchSupabaseListingById(table: 'properties' | 'rentals' | 'hotels', id: string) {
  const client = await ensureSupabaseClient();
  const { data, error } = await client
    .from(table)
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data ?? null;
}

export async function fetchSupabaseMessagesByContext(contextType: string, contextId: string) {
  const client = await ensureSupabaseClient();
  const { data, error } = await client
    .from('messages')
    .select('*')
    .eq('context_type', contextType)
    .eq('context_id', contextId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}
