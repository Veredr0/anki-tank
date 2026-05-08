// ═══════════════════════════════════════════════════════════════════
//  SRS ENGINE
//  All progress lives in playerState — swap get/set calls to an
//  API endpoint to add accounts/leaderboards.
// ═══════════════════════════════════════════════════════════════════
window.SRS = (function () {

  // The single source of truth for progress.
  // Replace localStorage calls here with fetch("/api/progress", ...) for accounts.
  const playerState = {
    cards: {},       // { [tankName]: { streak, weight, totalRight, totalWrong } }
    session: { right: 0, wrong: 0, hardRight: 0, total: 0 }
  };

  function getCard(name) {
    if (!playerState.cards[name]) {
      playerState.cards[name] = { streak: 0, weight: 3, totalRight: 0, totalWrong: 0 };
    }
    return playerState.cards[name];
  }

  function onCorrect(name) {
    const c = getCard(name);
    c.streak++;
    c.totalRight++;
    // Exponential decay — gets slower the better you know it (min weight 0.4)
    c.weight = Math.max(0.4, c.weight * 0.6);
    playerState.session.right++;
    playerState.session.total++;
    if (c.streak >= 2) playerState.session.hardRight++;
  }

  function onWrong(name) {
    const c = getCard(name);
    c.streak = 0;
    c.totalWrong++;
    // Boosted weight — you'll see it again very soon (max weight 10)
    c.weight = Math.min(10, c.weight * 2.0 + 1.5);
    playerState.session.wrong++;
    playerState.session.total++;
  }

  // Weighted random draw — cards you struggle with come up more often
  function pickNext(exclude) {
    const pool = window.TANKS.filter(t => t !== exclude);
    const total = pool.reduce((s, t) => s + getCard(t.name).weight, 0);
    let r = Math.random() * total;
    for (const t of pool) {
      r -= getCard(t.name).weight;
      if (r <= 0) return t;
    }
    return pool[pool.length - 1];
  }

  // Hard mode: is this card's streak >= 2?
  function isHardMode(name) {
    return getCard(name).streak >= 2;
  }

  // Get distractors: same era first, then same family/country within that era
  function getDistractors(tank) {
    const all     = window.TANKS.filter(t => t.name !== tank.name);
    const sameEra = all.filter(t => t.era === tank.era);
    const pool    = sameEra.length >= 3 ? sameEra : all;

    const family  = tank.family;
    const sameFam = family ? pool.filter(t => t.family === family) : [];

    if (sameFam.length >= 3) return shuffle(sameFam).slice(0, 3);

    const sameCountry = pool.filter(
      t => (t.nation||t.country) === (tank.nation||tank.country) && !sameFam.includes(t)
    );
    const blended = [...sameFam, ...shuffle(sameCountry)].slice(0, 3);
    if (blended.length >= 3) return blended;

    return shuffle(pool).slice(0, 3);
  }

  function buildCard(tank, hardMode) {
    const distractors = hardMode
      ? getDistractors(tank)
      : (() => {
          const others  = window.TANKS.filter(t => t.name !== tank.name);
          const sameEra = others.filter(t => t.era === tank.era);
          return shuffle(sameEra.length >= 3 ? sameEra : others).slice(0, 3);
        })();
    const choices = shuffle([...distractors, tank]);
    return {
      tank,
      choices: choices.map(t => t.name),
      correctIdx: choices.indexOf(tank),
      hardMode
    };
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Stub: replace with API call to persist player data
  function exportState() {
    return JSON.parse(JSON.stringify(playerState));
  }

  // Stub: replace with API call to load player data
  function importState(data) {
    Object.assign(playerState.cards, data.cards || {});
    Object.assign(playerState.session, data.session || {});
  }

  function getSessionStats() {
    return { ...playerState.session };
  }

  function getCardInfo(name) {
    return { ...getCard(name) };
  }

  return { pickNext, onCorrect, onWrong, isHardMode, buildCard, getSessionStats, getCardInfo, exportState, importState };
})();
