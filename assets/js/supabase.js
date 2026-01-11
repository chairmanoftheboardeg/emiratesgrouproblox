// /assets/js/supabase.js
// Requires supabase-js v2 loaded before this file.
(function(){
  const cfg = window.EGR_CONFIG || {};
  if(!cfg.supabaseUrl || !cfg.supabaseAnonKey || cfg.supabaseUrl.includes("PASTE_")){
    console.warn("Supabase not configured. Update /assets/js/config.js");
    window.sb = null;
    return;
  }
  window.sb = supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
})();
