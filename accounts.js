// ═══════════════════════════════════════════════════════════════════
//  ACCOUNT HELPERS (Supabase backend)
//  Requires _supabase to be initialised by supabase-config.js first.
// ═══════════════════════════════════════════════════════════════════
window.Accounts = (function () {

  // Cached after init() — keeps getCurrent/isValidSession synchronous
  let _currentUser = null;

  // Call once on page load before the app renders
  async function init() {
    const { data: { session } } = await _supabase.auth.getSession();
    if (session) {
      const { data } = await _supabase
        .from('progress')
        .select('nickname')
        .eq('user_id', session.user.id)
        .maybeSingle();
      _currentUser = data ? data.nickname : null;
    }
  }

  function getCurrent() {
    return _currentUser;
  }

  function isValidSession() {
    return !!_currentUser;
  }

  // Supabase Auth requires email — we derive one from the nickname
  function nickToEmail(nick) {
    return nick.toLowerCase() + '@ankitank.app';
  }

  async function isNicknameTaken(nickname) {
    const { data, error } = await _supabase
      .from('progress')
      .select('nickname')
      .ilike('nickname', nickname)
      .limit(1);
    return !error && data && data.length > 0;
  }

  async function create(nickname, password) {
    const { data, error } = await _supabase.auth.signUp({
      email: nickToEmail(nickname),
      password,
    });
    if (error) throw new Error(error.message);
    await _supabase.from('progress').insert({
      user_id: data.user.id,
      nickname,
      cards: {},
    });
    _currentUser = nickname;
  }

  async function login(nickname, password) {
    const { data, error } = await _supabase.auth.signInWithPassword({
      email: nickToEmail(nickname),
      password,
    });
    if (error) return false;
    const { data: prog } = await _supabase
      .from('progress')
      .select('nickname')
      .eq('user_id', data.user.id)
      .maybeSingle();
    _currentUser = prog ? prog.nickname : nickname;
    return true;
  }

  async function logout() {
    await _supabase.auth.signOut();
    _currentUser = null;
  }

  async function loadProgress() {
    const { data: { session } } = await _supabase.auth.getSession();
    if (!session) return null;
    const { data } = await _supabase
      .from('progress')
      .select('cards')
      .eq('user_id', session.user.id)
      .maybeSingle();
    return data ? { cards: data.cards || {} } : null;
  }

  async function saveProgress(cards) {
    const { data: { session } } = await _supabase.auth.getSession();
    if (!session) return;
    await _supabase.from('progress').update({ cards }).eq('user_id', session.user.id);
  }

  async function getLeaderboard() {
    const { data } = await _supabase.from('progress').select('nickname, cards');
    if (!data) return [];
    return data.map(row => {
      const cards = Object.values(row.cards || {});
      const totalRight = cards.reduce((s, c) => s + (c.totalRight || 0), 0);
      const totalWrong = cards.reduce((s, c) => s + (c.totalWrong || 0), 0);
      const mastered   = cards.filter(c => (c.streak || 0) >= 3).length;
      const total      = totalRight + totalWrong;
      const accuracy   = total > 0 ? Math.round(100 * totalRight / total) : 0;
      return { nickname: row.nickname, totalRight, totalWrong, mastered, accuracy };
    }).sort((a, b) => b.totalRight - a.totalRight);
  }

  return { init, getCurrent, isValidSession, create, login, logout, loadProgress, saveProgress, isNicknameTaken, getLeaderboard };
})();
