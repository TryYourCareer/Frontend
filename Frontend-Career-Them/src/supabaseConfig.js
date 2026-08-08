// We use supabase-js which is already included in your package.json
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || "https://supabase.co";
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || "placeholder-key";

// Safe flag to check if credentials are valid
export const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseUrl !== "https://supabase.co" && 
  supabaseAnonKey && 
  supabaseAnonKey !== "placeholder-key";

// Only initialize if we have real details, otherwise export null safely
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
