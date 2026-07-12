// Initialize Supabase Client
const SUPABASE_URL = "https://uheztwlyyhwvqvblfflw.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_itf4zlbAgZ-zaKrSYvT1pQ_2gA4mlIs";


// Global initialization of the Supabase Client SDK instance
if (typeof supabase === 'undefined') {
    console.error("Supabase SDK CDN failed to load properly. Check network logs.");
}

const supabaseClientInstance = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Exporting globally to match authorization and module scripts wrappers
window.supabase = supabaseClientInstance;