
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zllsjaraeamjcrohvoex.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsbHNqYXJhZWFtamNyb2h2b2V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNDE5NDIsImV4cCI6MjA3NzkxNzk0Mn0.dhZOS8YPHAaLyALMEkVsPn5fXrumoL7o77e9edlbcBM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // More secure auth flow
  },
});
