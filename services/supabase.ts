import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseKey;

if (!isSupabaseConfigured) {
  console.warn("Supabase credentials missing. App will default to mock mode.");
}

// Pass placeholders if missing to prevent "supabaseUrl is required" error
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseKey || 'placeholder-key'
);