// ═══════════════════════════════════════════════════════════════════
//  SUPABASE CONFIG
//  Replace the two placeholder values below with your project's
//  values from: https://app.supabase.com → Project Settings → API
//
//  IMPORTANT: In Supabase Dashboard → Authentication → Settings,
//  disable "Enable email confirmations" so friends can sign up
//  without needing to confirm an email.
// ═══════════════════════════════════════════════════════════════════
const SUPABASE_URL      = 'https://qurdtpnewnflivmwxaqq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1cmR0cG5ld25mbGl2bXd4YXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxODI2OTksImV4cCI6MjA5Mzc1ODY5OX0.BnBp-dnIZ1OT6fns1Bl1pvoDr3TA68388-538kvwueM';
window._supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
