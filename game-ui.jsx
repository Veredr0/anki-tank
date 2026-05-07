// ─── Game UI ──────────────────────────────────────────────────────
// Edit this file freely to restyle the flashcard game.
// Logic lives in srs-engine.js and accounts.js — don't touch those
// unless you're changing game mechanics.
// ──────────────────────────────────────────────────────────────────
const { useState, useEffect, useCallback } = React;

// ─── Colour palette ───────────────────────────────────────────────
const C = {
  bg:     "#efe7c8",
  bgDark: "#e6dcb0",
  panel:  "#fbf6e1",
  border: "#1c1c14",
  top:    "#2f3424",
  topFg:  "#e8e3c2",
  muted:  "#79735a",
  red:    "#c4452f",
  green:  "#5a6242",
  amber:  "#b07d1a",
  paper:  "#f1ebd2",
};

// ─── Utility ──────────────────────────────────────────────────────
const box = (extra = {}) => ({
  background: C.panel,
  border: `2px solid ${C.border}`,
  boxShadow: `0 2px 0 ${C.border}, 0 6px 14px rgba(0,0,0,0.18)`,
  ...extra,
});

// ─── Image path helper ────────────────────────────────────────────
function tankImagePath(name) {
  let s = name.toLowerCase();
  s = s.replace(/ä/g,"a").replace(/ö/g,"o").replace(/ü/g,"u").replace(/ß/g,"ss");
  s = s.replace(/\(t\)/g,"t").replace(/\(p\)/g,"p").replace(/\(h\)/g,"h");
  s = s.replace(/[^a-z0-9]+/g,"_").replace(/_+/g,"_").replace(/^_|_$/g,"");
  return "./images/" + s + ".jpg";
}

// ─── TankImage ────────────────────────────────────────────────────
function TankImage({ name, photoUrl, revealed }) {
  const localSrc = tankImagePath(name);
  const [src, setSrc] = useState(localSrc);
  const [err, setErr] = useState(false);
  useEffect(() => { setSrc(tankImagePath(name)); setErr(false); }, [name]);

  const handleError = () => {
    if (src !== photoUrl && photoUrl) {
      setSrc(photoUrl);
    } else {
      setErr(true);
    }
  };

  const imgStyle = {
    width: "100%", height: "100%", objectFit: "contain",
    filter: `sepia(0.35) contrast(1.05) saturate(0.85)${revealed ? "" : " brightness(0.8)"}`,
  };

  if (err) {
    return (
      <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center", gap:18,
        background:"linear-gradient(180deg,#d8cf9c,#c4b78e)", color:C.border,
        fontFamily:"'Special Elite',monospace", position:"relative" }}>
        <div style={{ position:"absolute", inset:0,
          backgroundImage:"linear-gradient(rgba(28,28,20,0.08) 1px,transparent 1px),linear-gradient(90deg,rgba(28,28,20,0.08) 1px,transparent 1px)",
          backgroundSize:"16px 16px" }} />
        <div style={{ fontSize:11, letterSpacing:2.5, textTransform:"uppercase", opacity:0.5, fontWeight:700 }}>
          FIG. — SILHOUETTE
        </div>
        <svg viewBox="0 0 220 80" width="70%" style={{ maxWidth:480, position:"relative" }}>
          <g transform="translate(10,8)">
            <rect x="0" y="42" width="200" height="14" rx="7" fill={C.border} opacity="0.92"/>
            {[14,36,58,80,102,124,146,168,188].map((cx,i)=>
              <circle key={i} cx={cx} cy="50" r="6" fill="#c4b78e" stroke={C.border} strokeWidth="1.5"/>)}
            <path d="M 6 42 L 18 28 L 186 28 L 198 42 Z" fill={C.border} opacity="0.94"/>
            <path d="M 66 28 L 74 12 L 136 12 L 144 28 Z" fill={C.border}/>
            <rect x="140" y="16" width="68" height="4" fill={C.border}/>
            <rect x="208" y="13" width="9" height="10" fill={C.border}/>
            <circle cx="105" cy="13" r="3.5" fill="#c4b78e" stroke={C.border} strokeWidth="1"/>
          </g>
        </svg>
        <div style={{ fontSize:9, letterSpacing:2, opacity:0.4, textTransform:"uppercase" }}>
          photograph offline · silhouette reference
        </div>
      </div>
    );
  }
  return <img src={src} alt="armored vehicle" style={imgStyle} onError={handleError} />;
}

// ─── StreakPips ───────────────────────────────────────────────────
function StreakPips({ streak, hardMode }) {
  const color = hardMode ? C.amber : C.green;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:4 }}>
      {Array.from({ length: Math.min(streak, 6) }).map((_, i) => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius:"50%",
          background: color, border:`1px solid ${C.border}`,
          boxShadow: hardMode ? `0 0 4px ${C.amber}` : "none",
        }}/>
      ))}
      {streak > 6 && <span style={{ fontSize:9, color, letterSpacing:1 }}>+{streak-6}</span>}
    </div>
  );
}

// ─── TankCard ─────────────────────────────────────────────────────
function TankCard({ card, cardInfo, picked, revealed, onPick, onAdvance, session }) {
  const t = card.tank;
  const hardMode = card.hardMode;

  const accentColor = hardMode ? C.amber : C.red;
  const modeLabel   = hardMode ? "VARIANT CHALLENGE" : "IDENTIFY THE VEHICLE";

  return (
    <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column",
      background:`linear-gradient(180deg,${C.bg} 0%,${C.bgDark} 100%)`,
      fontFamily:"'Special Elite','Courier New',monospace", color:C.border,
      overflow:"hidden", position:"relative" }}>

      {/* paper grain */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none",
        backgroundImage:"radial-gradient(rgba(120,90,30,0.06) 1px,transparent 1px)",
        backgroundSize:"3px 3px", mixBlendMode:"multiply" }}/>

      {/* TOP BAR */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"12px 28px", background:C.top, color:C.topFg,
        borderBottom:"3px double #1a1d12", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:32, height:32, background:accentColor, color:"#f0ebd0",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:18, fontWeight:700, border:"2px solid #1a1d12" }}>★</div>
          <div>
            <div style={{ fontSize:18, letterSpacing:2, fontWeight:700 }}>ARMOR ID</div>
            <div style={{ fontSize:10, letterSpacing:1, opacity:0.65 }}>FIELD TRAINING DECK · WWII → PRESENT</div>
          </div>
        </div>

        {/* SESSION STATS */}
        <div style={{ display:"flex", alignItems:"center", gap:20, fontSize:11, letterSpacing:1.2 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6,
            padding:"3px 10px", background:C.amber, color:"#1a1a14",
            border:"2px solid #1a1d12", fontSize:10, fontWeight:700, letterSpacing:1.5,
            visibility: cardInfo.streak >= 2 ? "visible" : "hidden" }}>
            🔥 STREAK ×{cardInfo.streak}
          </div>
          <span style={{ opacity:0.7 }}>
            ✓ {session.right} · ✗ {session.wrong} · TOTAL {session.total}
          </span>
          <a href="index.html"
            style={{ fontSize:10, letterSpacing:1.5, color:C.topFg, opacity:0.55,
              textDecoration:"none", border:`1px solid ${C.topFg}`, padding:"3px 8px",
              fontFamily:"'Special Elite',monospace", transition:"opacity 0.15s" }}
            onMouseOver={e => e.currentTarget.style.opacity = 1}
            onMouseOut={e => e.currentTarget.style.opacity = 0.55}>
            ← DEBRIEF
          </a>
        </div>
      </div>

      {/* BODY */}
      <div style={{ flex:1, display:"flex", padding:"18px 28px 14px", gap:20, minHeight:0 }}>

        {/* LEFT COL */}
        <div style={{ flex:"1 1 60%", display:"flex", flexDirection:"column", gap:14, minWidth:0 }}>

          {/* PHOTO PLATE */}
          <div style={{ ...box(), flex:1, display:"flex", flexDirection:"column", overflow:"hidden",
            position:"relative", minHeight:0 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"7px 14px", borderBottom:`1px solid ${C.border}`,
              fontSize:10, letterSpacing:1.5, color:C.muted, textTransform:"uppercase",
              background:C.paper }}>
              <span>FIG. A — IDENTIFICATION PLATE</span>
              <span>{revealed ? `${(t.nation||t.country||'').toUpperCase()} · ${t.year}` : "ORIGIN ████"}</span>
            </div>
            <div style={{ flex:1, position:"relative", overflow:"hidden",
              background:"#3a3a30", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <TankImage name={t.name} photoUrl={t.photo} revealed={revealed}/>
              {/* Stamp overlay */}
              <div style={{ position:"absolute", top:50, right:30,
                border:`3px solid ${revealed ? C.green : accentColor}`,
                color: revealed ? C.green : accentColor,
                padding:"4px 14px", transform:"rotate(-8deg)",
                fontSize:14, letterSpacing:2, fontWeight:700,
                fontFamily:"'Special Elite',monospace",
                pointerEvents:"none", opacity:0.85,
                background:"rgba(251,246,225,0.4)" }}>
                {revealed ? "IDENTIFIED" : hardMode ? "VARIANT?" : "UNKNOWN"}
              </div>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", padding:"5px 14px",
              fontSize:10, letterSpacing:1.5, color:C.muted,
              borderTop:`1px solid ${C.border}`, background:C.paper }}>
              <span>SIDE VIEW · FIELD MANUAL</span>
              <span>SCALE 1:60</span>
            </div>
          </div>

          {/* DESIGNATION — always rendered, masked until revealed */}
          <div style={{ ...box(), padding:"10px 18px", flexShrink:0 }}>
            <div style={{ fontSize:10, letterSpacing:2, color:C.muted, textTransform:"uppercase", marginBottom:4 }}>DESIGNATION</div>
            {revealed
              ? <div style={{ fontSize:24, fontWeight:700, letterSpacing:1 }}>{t.name.toUpperCase()}</div>
              : <div style={{ display:"flex", gap:6, paddingTop:2 }}>
                  <div style={{ height:24, background:C.border, borderRadius:1, width:"55%", opacity:0.85 }}/>
                  <div style={{ height:24, background:C.border, borderRadius:1, width:"22%", opacity:0.55 }}/>
                </div>
            }
          </div>
        </div>

        {/* RIGHT COL */}
        <div style={{ flex:"1 1 40%", display:"flex", flexDirection:"column", gap:14, minWidth:0 }}>

          {/* DOSSIER */}
          <div style={{ ...box(), padding:"12px 18px", display:"flex", flexDirection:"column", gap:9 }}>
            <div style={{ fontSize:10, letterSpacing:2, color:C.muted, textTransform:"uppercase",
              borderBottom:`1px solid ${C.border}`, paddingBottom:4, marginBottom:2 }}>DOSSIER</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"7px 14px" }}>
              {[["ORIGIN",t.nation||t.country],["YEAR",String(t.year)],["CREW",String(t.crew)],["MAIN GUN",t.gun],["ERA",t.era],["NICKNAME",t.nickname]].map(([k,v])=>(
                <div key={k} style={{ display:"flex", flexDirection:"column", gap:2 }}>
                  <div style={{ fontSize:9, letterSpacing:1.5, color:C.muted, textTransform:"uppercase" }}>{k}</div>
                  <div style={{ height:18, display:"flex", alignItems:"center" }}>
                    {revealed
                      ? <div style={{ fontSize:13, fontWeight:700, letterSpacing:0.5, lineHeight:1 }}>{v||"—"}</div>
                      : <div style={{ height:13, background:C.border, borderRadius:1, width:`${50+k.length%4*12}%`, opacity:0.85 }}/>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* QUIZ / INTEL — overlaid, same size always */}
          <div style={{ position:"relative", flex:1, minHeight:0 }}>

            {/* QUIZ PANEL */}
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", gap:10,
              opacity: revealed ? 0 : 1, pointerEvents: revealed ? "none" : "auto",
              transition:"opacity 0.18s ease" }}>
              <div style={{ ...box(), padding:"12px 18px", display:"flex", flexDirection:"column", gap:10, height:"100%" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                  paddingBottom:8, borderBottom:`1px solid ${C.border}` }}>
                  <div style={{ fontSize:12, letterSpacing:2, fontWeight:700, color: hardMode ? C.amber : C.border }}>
                    {modeLabel}
                  </div>
                  {cardInfo.streak > 0 && <StreakPips streak={cardInfo.streak} hardMode={hardMode}/>}
                </div>
                {hardMode && (
                  <div style={{ fontSize:10, letterSpacing:1, color:C.amber, paddingBottom:4,
                    fontStyle:"italic", borderBottom:`1px dashed ${C.amber}` }}>
                    All options are from the same vehicle family
                  </div>
                )}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  {card.choices.map((opt, i) => {
                    const isPicked = picked === i;
                    const isCorrect = picked != null && i === card.correctIdx;
                    const isWrong = isPicked && i !== card.correctIdx;
                    const state = isCorrect ? "correct" : isWrong ? "wrong" : "idle";
                    return (
                      <button key={i}
                        style={{
                          padding:"9px 12px",
                          border:`2px solid ${state==="correct"?C.green:state==="wrong"?C.red:C.border}`,
                          background:state==="correct"?"#dde7d3":state==="wrong"?"#f0d8d0":C.panel,
                          fontFamily:"'Special Elite',monospace",
                          fontSize:12, fontWeight:700, letterSpacing:0.5,
                          cursor:state==="idle"?"pointer":"default",
                          display:"flex", alignItems:"center", justifyContent:"space-between",
                          textAlign:"left",
                          color:state==="wrong"?C.red:state==="correct"?C.green:C.border,
                          transition:"background 0.15s, border-color 0.15s",
                        }}
                        onClick={() => picked == null && onPick(i)}
                        disabled={picked != null}>
                        <span>
                          <span style={{ display:"inline-block", width:20, height:20, marginRight:8,
                            background:C.border, color:"#f0ebd0", textAlign:"center", lineHeight:"20px",
                            fontSize:10, borderRadius:2 }}>{"ABCD"[i]}</span>
                          {opt.toUpperCase()}
                        </span>
                        <span style={{ fontSize:16 }}>{isCorrect?"✓":isWrong?"✗":""}</span>
                      </button>
                    );
                  })}
                </div>
                {/* FIELD NOTE placeholder */}
                <div style={{ ...box(), padding:"11px 15px", marginTop:"auto", flexShrink:0 }}>
                  <div style={{ fontSize:10, letterSpacing:2, color:C.muted, textTransform:"uppercase",
                    borderBottom:`1px solid ${C.border}`, paddingBottom:4, marginBottom:8 }}>FIELD NOTE</div>
                  <p style={{ fontSize:14, lineHeight:1.35, fontFamily:"'Special Elite',monospace",
                    color:"#3a3a30", margin:0 }}>
                    <span style={{ background:C.border, color:"transparent", borderRadius:1, opacity:0.5,
                      userSelect:"none", display:"block", height:19, width:"92%", marginBottom:4 }}/>
                    <span style={{ background:C.border, color:"transparent", borderRadius:1, opacity:0.35,
                      userSelect:"none", display:"block", height:19, width:"68%" }}/>
                  </p>
                </div>
              </div>
            </div>

            {/* INTEL PANEL */}
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", gap:12,
              opacity: revealed ? 1 : 0, pointerEvents: revealed ? "auto" : "none",
              transition:"opacity 0.18s ease" }}>
              <div style={{ ...box(), padding:"11px 15px", flex:1, overflow:"auto" }}>
                <div style={{ fontSize:10, letterSpacing:2, color:C.muted, textTransform:"uppercase",
                  borderBottom:`1px solid ${C.border}`, paddingBottom:4, marginBottom:8 }}>HOW TO SPOT IT</div>
                <ul style={{ margin:0, padding:0, listStyle:"none", display:"flex", flexDirection:"column", gap:5 }}>
                  {(t.spotting||[]).map((s,i) => (
                    <li key={i} style={{ fontSize:14, lineHeight:1.3, paddingLeft:16, position:"relative",
                      fontFamily:"'Special Elite',monospace" }}>
                      <span style={{ position:"absolute", left:0, top:0, color:accentColor, fontWeight:700 }}>›</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ ...box(), padding:"11px 15px", flexShrink:0 }}>
                <div style={{ fontSize:10, letterSpacing:2, color:C.muted, textTransform:"uppercase",
                  borderBottom:`1px solid ${C.border}`, paddingBottom:4, marginBottom:8 }}>FIELD NOTE</div>
                <p style={{ fontSize:14, lineHeight:1.35, fontFamily:"'Special Elite',monospace",
                  color:"#3a3a30", margin:0 }}>{t.fact}</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div style={{ flexShrink:0, height:52, padding:"0 28px", display:"flex", alignItems:"center",
        justifyContent:"space-between", background:C.top, color:C.topFg,
        borderTop:"3px double #1a1d12", fontSize:11, letterSpacing:1.5, overflow:"hidden" }}>
        <span style={{ opacity:0.75, display:"inline-block", width:240, whiteSpace:"nowrap", overflow:"hidden" }}>
          {picked == null ? "PICK A NAME · or press 1–4"
            : revealed ? "PRESS SPACE → NEXT VEHICLE"
            : "PRESS SPACE → REVEAL INTEL"}
        </span>
        {/* Weight indicator */}
        <div style={{ flex:1, margin:"0 24px", display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ flex:1, height:6, background:"#1a1d12", border:"1px solid #4a4f3a" }}>
            <div style={{ height:"100%", background:accentColor,
              width:`${Math.min(100, (cardInfo.weight / 10) * 100)}%`,
              transition:"width 0.3s" }}/>
          </div>
          <span style={{ fontSize:9, opacity:0.5, letterSpacing:1 }}>PRIORITY</span>
        </div>
        <button
          style={{
            width:172, height:36,
            textAlign:"center",
            background: picked != null ? C.green : "#3a3f2c",
            color: picked != null ? "#f0ebd0" : "#79735a",
            border:"2px solid #1a1d12",
            fontFamily:"'Special Elite',monospace",
            fontSize:12, letterSpacing:1.5, fontWeight:700,
            cursor: picked != null ? "pointer" : "default",
            flexShrink:0,
            transition:"background 0.15s, color 0.15s",
          }}
          onClick={() => picked != null && onAdvance()}
          disabled={picked == null}>
          {revealed ? "NEXT VEHICLE ▶" : picked != null ? "REVEAL INTEL" : "WAITING…"}
        </button>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────
function App() {
  const [ready, setReady]       = useState(false);
  const [card, setCard]         = useState(null);
  const [picked, setPicked]     = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [session, setSession]   = useState({ right: 0, wrong: 0, hardRight: 0, total: 0 });
  const [cardInfo, setCardInfo] = useState(null);

  useEffect(() => {
    (async () => {
      await Accounts.init();
      if (!Accounts.isValidSession()) { window.location.replace("index.html"); return; }
      try {
        const filterRaw = sessionStorage.getItem("ankitank_custom_filter");
        if (filterRaw) {
          const filter = JSON.parse(filterRaw);
          const filtered = window.TANKS.filter(t => {
            const nationOk = !filter.nations || !filter.nations.length || filter.nations.indexOf(t.nation) !== -1;
            const eraOk    = !filter.eras   || !filter.eras.length   || filter.eras.indexOf(t.era)    !== -1;
            return nationOk && eraOk;
          });
          if (filtered.length >= 4) window.TANKS = filtered;
          sessionStorage.removeItem("ankitank_custom_filter");
        }
      } catch(e) {}
      const progress = await Accounts.loadProgress();
      if (progress) SRS.importState({ cards: progress.cards || {}, session: { right:0, wrong:0, hardRight:0, total:0 } });
      const t = SRS.pickNext(null);
      const c = SRS.buildCard(t, SRS.isHardMode(t.name));
      setCard(c);
      setCardInfo(SRS.getCardInfo(t.name));
      setSession(SRS.getSessionStats());
      setReady(true);
    })();
  }, []);

  const refreshSession = () => setSession(SRS.getSessionStats());

  const nextCard = useCallback(() => {
    if (!card) return;
    const next = SRS.pickNext(card.tank);
    const hardMode = SRS.isHardMode(next.name);
    setCard(SRS.buildCard(next, hardMode));
    setCardInfo(SRS.getCardInfo(next.name));
    setPicked(null);
    setRevealed(false);
    refreshSession();
  }, [card]);

  const saveProgress = useCallback(() => {
    const { cards } = SRS.exportState();
    Accounts.saveProgress(cards);
  }, []);

  const handlePick = (i) => {
    if (!card || picked != null) return;
    setPicked(i);
    if (i === card.correctIdx) {
      SRS.onCorrect(card.tank.name);
    } else {
      SRS.onWrong(card.tank.name);
    }
    setCardInfo(SRS.getCardInfo(card.tank.name));
    refreshSession();
    saveProgress();
  };

  const handleAdvance = () => {
    if (revealed) {
      nextCard();
    } else {
      setRevealed(true);
    }
  };

  // Keyboard: 1-4 pick choice, space/enter advance
  useEffect(() => {
    const handler = (e) => {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); handleAdvance(); }
      if (["1","2","3","4"].includes(e.key)) handlePick(parseInt(e.key) - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleAdvance, handlePick]);

  if (!ready) return (
    <div className="stage" style={{ display:"flex", alignItems:"center", justifyContent:"center",
      color:"#e8e3c2", fontFamily:"'Special Elite',monospace", fontSize:11, letterSpacing:3 }}>
      LOADING FIELD INTEL...
    </div>
  );

  return (
    <div className="stage">
      <TankCard
        card={card}
        cardInfo={cardInfo}
        picked={picked}
        revealed={revealed}
        onPick={handlePick}
        onAdvance={handleAdvance}
        session={session}
      />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
