import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const anon = process.env.VITE_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anon) {
  console.error('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY missing in .env.local');
  process.exit(2);
}

const client = createClient(url, anon);

const testEmail = process.env.TEST_EMAIL || `ujenzi-test+${Date.now()}@example.com`;
const testPassword = process.env.TEST_PASSWORD || 'Testpass123!';

console.log('Using test account:', testEmail);

try {
  // Try sign up using anon key
  const signUp = await client.auth.signUp({ email: testEmail, password: testPassword, options: { data: { full_name: 'UJENZI Test' } } });
  if (signUp.error) {
    console.log('Sign-up (anon) returned error:', signUp.error.message);
  } else {
    console.log('Sign-up (anon) succeeded. If confirmation is required, sign-in may still fail.');
  }

  // Try sign-in
  const signIn = await client.auth.signInWithPassword({ email: testEmail, password: testPassword });
  if (signIn.error) {
    console.log('Sign-in (anon) failed:', signIn.error.message);

    // If sign-in failed and we have service role key, try admin createUser to force-confirm account
    if (service) {
      console.log('Attempting server-side createUser with service role key to ensure account is confirmed...');
      const admin = createClient(url, service, { auth: { persistSession: false } });
      try {
        if (admin.auth && admin.auth.admin && typeof admin.auth.admin.createUser === 'function') {
          // createUser API
          await admin.auth.admin.createUser({ email: testEmail, password: testPassword, email_confirm: true, user_metadata: { full_name: 'UJENZI Test' } });
          console.log('Admin createUser succeeded. Trying sign-in again...');
          const signIn2 = await client.auth.signInWithPassword({ email: testEmail, password: testPassword });
          if (signIn2.error) {
            console.log('Sign-in still failed after admin create:', signIn2.error.message);
            process.exit(1);
          } else {
            console.log('Sign-in successful after admin create. User id:', signIn2.data.user?.id);
            console.log('Authentication verified — frontend should be able to sign in with these credentials.');
            process.exit(0);
          }
        } else {
          console.log('Admin createUser API not available in this client version. Cannot force-confirm user.');
          process.exit(1);
        }
      } catch (e) {
        console.log('Admin createUser failed:', e instanceof Error ? e.message : String(e));
        process.exit(1);
      }
    } else {
      console.log('No service role key available to force-confirm account. If your Supabase requires email confirmation, sign-in will fail until you confirm the account via email or create via admin API.');
      process.exit(1);
    }
  } else {
    console.log('Sign-in successful. User id:', signIn.data.user?.id);
    console.log('Authentication verified — frontend should be able to sign in with these credentials.');
    process.exit(0);
  }
} catch (err) {
  console.error('Unexpected error during test:', err instanceof Error ? err.message : String(err));
  process.exit(1);
}
