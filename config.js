// config.js
// 1. Import Supabase from the CDN (We will load this in HTML)
// 2. Your Configuration
const SUPABASE_URL = 'https://hmoqjjsrfoxpihwxjlru.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhtb3FqanNyZm94cGlod3hqbHJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMTg0NTgsImV4cCI6MjA4MzU5NDQ1OH0.4X0Shdy8y_SkPDvAm4sRcosNaSBH8EKUsRqumbVR-7w';

// 3. Initialize Client
const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 4. Global Variables for Corporate Identity
const ORGANIZATION_NAME = "Emirates Group Roblox";
const CURRENT_YEAR = new Date().getFullYear();

// 5. Check Login Status (Runs on every page load)
async function checkSession() {
    const { data: { session } } = await sb.auth.getSession();
    updateNav(session);
    return session;
}

// 6. Update Navigation Bar based on Login
function updateNav(session) {
    const loginBtn = document.getElementById('nav-login');
    const dashboardBtn = document.getElementById('nav-dashboard');
    
    if (session) {
        if(loginBtn) loginBtn.style.display = 'none';
        if(dashboardBtn) dashboardBtn.style.display = 'block';
    } else {
        if(loginBtn) loginBtn.style.display = 'block';
        if(dashboardBtn) dashboardBtn.style.display = 'none';
    }
}

// 7. Discord Login Function
async function loginWithDiscord() {
    const { data, error } = await sb.auth.signInWithOAuth({
        provider: 'discord',
        options: {
            redirectTo: window.location.origin + '/dashboard.html' // Where they go after login
        }
    });
    if (error) console.error('Login error:', error);
}

// 8. Logout Function
async function logout() {
    const { error } = await sb.auth.signOut();
    if (!error) window.location.href = '/index.html';
}
