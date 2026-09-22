// We use supabase-js which is already included in your package.json
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.REACT_APP_SUPABASE_URL ||
  "https://nuoqmfbooawrabkrsacq.supabase.co";

const supabaseAnonKey =
  process.env.REACT_APP_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51b3FtZmJvb2F3cmFia3JzYWNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyODg3MTgsImV4cCI6MjA5Nzg2NDcxOH0.NIEy1JZgzqrTl2-SUVDAiuqSYKIfxNTpQqeVxAu2d2k";

// Safe flag to check if credentials are valid
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl !== "https://supabase.co" &&
  supabaseAnonKey &&
  supabaseAnonKey !== "placeholder-key"
);

// Single configured Supabase client instance with auto session refresh
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== "undefined" ? window.localStorage : undefined,
      },
    })
  : null;

