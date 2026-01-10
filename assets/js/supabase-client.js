// /assets/js/supabase-client.js
// Requires supabase-js loaded before this file.
window.sb = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
