/**
 * Supabase JS client for Auth + Realtime.
 *
 * This is distinct from supabaseConfig.js (which has fallback guards
 * for environments without credentials).  This file is used exclusively
 * by the communities feature for Realtime channel subscriptions.
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.REACT_APP_SUPABASE_URL ||
  "https://nuoqmfbooawrabkrsacq.supabase.co";

const supabaseAnonKey =
  process.env.REACT_APP_SUPABASE_ANON_KEY ||
  // fallback to the key already hardcoded in supabaseConfig.js
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51b3FtZmJvb2F3cmFia3JzYWNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyODg3MTgsImV4cCI6MjA5Nzg2NDcxOH0.NIEy1JZgzqrTl2-SUVDAiuqSYKIfxNTpQqeVxAu2d2k";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
