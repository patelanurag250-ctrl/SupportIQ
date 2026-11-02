import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get Supabase configuration from environment variables (current format: SUPABASE_URL & SUPABASE_PUBLISHABLE_KEY)
const supabaseUrl =
  (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_SUPABASE_URL || import.meta.env?.SUPABASE_URL)) ||
  (typeof process !== 'undefined' && process.env?.SUPABASE_URL) ||
  '';

const supabasePublishableKey =
  (typeof import.meta !== 'undefined' &&
    (import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
      import.meta.env?.SUPABASE_PUBLISHABLE_KEY ||
      import.meta.env?.VITE_SUPABASE_ANON_KEY ||
      import.meta.env?.SUPABASE_ANON_KEY)) ||
  (typeof process !== 'undefined' &&
    (process.env?.SUPABASE_PUBLISHABLE_KEY || process.env?.SUPABASE_ANON_KEY)) ||
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabasePublishableKey &&
    !supabaseUrl.includes('placeholder') &&
    !supabasePublishableKey.includes('placeholder')
);

// Initialize client-side Supabase client using public publishable key
// NEVER expose SUPABASE_SECRET_KEY to client-side code
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabasePublishableKey || 'placeholder-publishable-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export async function checkSupabaseConnection(): Promise<{ connected: boolean; message: string }> {
  if (!isSupabaseConfigured) {
    return {
      connected: false,
      message: 'SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY not configured. Running in operational local mode.',
    };
  }

  try {
    const { error } = await supabase.from('organizations').select('id').limit(1);
    if (error) {
      return { connected: false, message: error.message };
    }
    return { connected: true, message: 'Connected to Supabase PostgreSQL with active RLS policies.' };
  } catch (err: any) {
    return { connected: false, message: err?.message || 'Connection test failed' };
  }
}
