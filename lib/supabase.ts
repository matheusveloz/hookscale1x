import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.\n' +
      'Required:\n' +
      '- NEXT_PUBLIC_SUPABASE_URL\n' +
      '- SUPABASE_SERVICE_ROLE_KEY\n\n' +
      'See SUPABASE_SETUP.md for instructions.'
    );
  }

  supabaseInstance = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseInstance;
}

// Export a getter instead of the direct instance
export const supabase = new Proxy({} as SupabaseClient, {
  get: (target, prop) => {
    const client = getSupabaseClient();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
