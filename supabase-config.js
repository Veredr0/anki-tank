// ═══════════════════════════════════════════════════════════════════
//  SUPABASE CONFIG
//  Replace the two placeholder values below with your project's
//  values from: https://app.supabase.com → Project Settings → API
//
//  IMPORTANT: In Supabase Dashboard → Authentication → Settings,
//  disable "Enable email confirmations" so friends can sign up
//  without needing to confirm an email.
// ═══════════════════════════════════════════════════════════════════
const SUPABASE_URL      = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
window._supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
