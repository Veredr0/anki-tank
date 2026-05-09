// ─── Game UI ──────────────────────────────────────────────────────
// Edit this file freely to restyle the flashcard game.
// Logic lives in srs-engine.js and accounts.js — don't touch those
// unless you're changing game mechanics.
// ──────────────────────────────────────────────────────────────────
const { useState, useEffect, useCallback } = React;

// ─── Language ─────────────────────────────────────────────────────
const LanguageContext = React.createContext(null);

function useLanguage() {
  const [lang, setLangState] = useState(() => {
    const s = localStorage.getItem("ankitank_language");
    return (s === "EN" || s === "FR") ? s : "FR";
  });
  function setLang(l) { localStorage.setItem("ankitank_language", l); setLangState(l); }
  function t(key) { return window.TRANSLATIONS?.[lang]?.[key] ?? key; }
  return { lang, setLang, t };
}

function LanguageProvider({ children }) {
  const language = useLanguage();
  return <LanguageContext.Provider value={language}>{children}</LanguageContext.Provider>;
}

function useLang() { return React.useContext(LanguageContext); }

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

// ─── Fuzzy matching for write mode ────────────────────────────────
function levenshtein(a, b) {
  const dp = Array.from({length: a.length+1}, (_,i) => Array.from({length: b.length+1}, (_,j) => i===0?j:j===0?i:0));
  for (let i=1;i<=a.length;i++) for (let j=1;j<=b.length;j++)
    dp[i][j] = a[i-1]===b[j-1] ? dp[i-1][j-1] : 1+Math.min(dp[i-1][j-1],dp[i-1][j],dp[i][j-1]);
  return dp[a.length][b.length];
}
function fuzzyMatch(input, target) {
  const a = input.trim().toLowerCase(), b = target.trim().toLowerCase();
  if (a === b) return true;
  return levenshtein(a, b) <= Math.max(1, Math.floor(b.length / 5));
}

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
  const { t } = useLang();
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
          {t("game.fig_silhouette")}
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
          {t("game.photo_offline")}
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
function TankCard({ card, cardInfo, picked, revealed, onPick, onAdvance, session, writeInput, onWriteInputChange, onWriteSubmit }) {
  const { lang, setLang, t } = useLang();
  const veh = card.tank;
  const hardMode = card.hardMode;
  const writeMode = card.writeMode;

  const accentColor = writeMode ? C.amber : (hardMode ? C.amber : C.red);
  const modeLabel   = writeMode ? t("game.mode.free_recall") : (hardMode ? t("game.mode.variant") : t("game.mode.identify"));

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
            <div style={{ fontSize:10, letterSpacing:1, opacity:0.65 }}>{t("topbar.subtitle")}</div>
          </div>
        </div>

        {/* SESSION STATS */}
        <div style={{ display:"flex", alignItems:"center", gap:16, fontSize:11, letterSpacing:1.2 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6,
            padding:"3px 10px", background:C.amber, color:"#1a1a14",
            border:"2px solid #1a1d12", fontSize:10, fontWeight:700, letterSpacing:1.5,
            visibility: cardInfo.streak >= 2 ? "visible" : "hidden" }}>
            🔥 {t("game.streak")} ×{cardInfo.streak}
          </div>
          <span style={{ opacity:0.7 }}>
            ✓ {session.right} · ✗ {session.wrong} · TOTAL {session.total}
          </span>
          <div style={{ display:"flex", alignItems:"center", gap:2 }}>
            {["EN","FR"].map(l => (
              <span key={l} onClick={() => setLang(l)} style={{
                padding:"3px 8px", fontSize:10, letterSpacing:1.5, cursor: lang === l ? "default" : "pointer",
                background: lang === l ? C.topFg : "transparent",
                color:       lang === l ? C.top   : C.topFg,
                fontWeight:  lang === l ? 700 : 400,
                border:`1px solid ${C.topFg}`,
                marginLeft: l === "EN" ? 0 : -1,
              }}>{l}</span>
            ))}
          </div>
          <a href="index.html"
            style={{ fontSize:10, letterSpacing:1.5, color:C.topFg, opacity:0.55,
              textDecoration:"none", border:`1px solid ${C.topFg}`, padding:"3px 8px",
              fontFamily:"'Special Elite',monospace", transition:"opacity 0.15s" }}
            onMouseOver={e => e.currentTarget.style.opacity = 1}
            onMouseOut={e => e.currentTarget.style.opacity = 0.55}>
            {t("game.debrief")}
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
              <span>{t("game.fig_a")}</span>
              <span>{revealed ? `${(veh.nation||veh.country||'').toUpperCase()} · ${veh.year}` : t("game.origin_masked")}</span>
            </div>
            <div style={{ flex:1, position:"relative", overflow:"hidden",
              background:"#3a3a30", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <TankImage name={veh.name} photoUrl={veh.photo} revealed={revealed}/>
              {/* Stamp overlay */}
              <div style={{ position:"absolute", top:50, right:30,
                border:`3px solid ${revealed ? C.green : accentColor}`,
                color: revealed ? C.green : accentColor,
                padding:"4px 14px", transform:"rotate(-8deg)",
                fontSize:14, letterSpacing:2, fontWeight:700,
                fontFamily:"'Special Elite',monospace",
                pointerEvents:"none", opacity:0.85,
                background:"rgba(251,246,225,0.4)" }}>
                {revealed ? t("game.stamp.identified") : writeMode ? t("game.stamp.recall") : hardMode ? t("game.stamp.variant") : t("game.stamp.unknown")}
              </div>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", padding:"5px 14px",
              fontSize:10, letterSpacing:1.5, color:C.muted,
              borderTop:`1px solid ${C.border}`, background:C.paper }}>
              <span>{t("game.side_view")}</span>
              <span>{t("game.scale")}</span>
            </div>
          </div>

          {/* DESIGNATION — always rendered, masked until revealed */}
          <div style={{ ...box(), padding:"10px 18px", flexShrink:0 }}>
            <div style={{ fontSize:10, letterSpacing:2, color:C.muted, textTransform:"uppercase", marginBottom:4 }}>{t("game.designation")}</div>
            {revealed
              ? <div style={{ fontSize:24, fontWeight:700, letterSpacing:1 }}>{veh.name.toUpperCase()}</div>
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
              borderBottom:`1px solid ${C.border}`, paddingBottom:4, marginBottom:2 }}>{t("field.dossier")}</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"7px 14px" }}>
              {[[t("field.origin"),veh.nation||veh.country],[t("field.year"),String(veh.year)],[t("field.crew"),String(veh.crew)],[t("field.main_gun"),veh.gun],[t("field.era"),veh.era],[t("field.nickname"),veh.nickname]].map(([k,v])=>(
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
                  <div style={{ fontSize:12, letterSpacing:2, fontWeight:700, color: (writeMode || hardMode) ? C.amber : C.border }}>
                    {modeLabel}
                  </div>
                  {cardInfo.streak > 0 && <StreakPips streak={cardInfo.streak} hardMode={hardMode || writeMode}/>}
                </div>
                {hardMode && !writeMode && (
                  <div style={{ fontSize:10, letterSpacing:1, color:C.amber, paddingBottom:4,
                    fontStyle:"italic", borderBottom:`1px dashed ${C.amber}` }}>
                    {t("game.hint.variants")}
                  </div>
                )}
                {writeMode ? (
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    <div style={{ fontSize:10, letterSpacing:1, color:C.amber, fontStyle:"italic",
                      paddingBottom:4, borderBottom:`1px dashed ${C.amber}` }}>
                      {t("game.hint.write")}
                    </div>
                    <input
                      value={writeInput}
                      onChange={e => onWriteInputChange(e.target.value)}
                      onKeyDown={e => { if (e.key==="Enter" && picked==null) { e.preventDefault(); onWriteSubmit(); } }}
                      disabled={picked != null}
                      placeholder={t("game.input.placeholder")}
                      autoFocus
                      style={{
                        fontFamily:"'Special Elite',monospace", fontSize:16, padding:"9px 12px",
                        border:`2px solid ${picked===true?C.green:picked===false?C.red:C.border}`,
                        background: picked===true?"#dde7d3":picked===false?"#f0d8d0":C.panel,
                        color:C.border, letterSpacing:0.5, width:"100%", boxSizing:"border-box",
                        outline:"none",
                      }}
                    />
                    {picked != null && (
                      <div style={{ fontSize:12, fontWeight:700, letterSpacing:0.5,
                        color: picked===true ? C.green : C.red }}>
                        {picked===true ? `${t("game.result.correct")} — ${veh.name.toUpperCase()}` : `${t("game.result.wrong")} — ${veh.name.toUpperCase()}`}
                      </div>
                    )}
                    {picked == null && (
                      <button onClick={onWriteSubmit} disabled={!writeInput.trim()}
                        style={{ padding:"9px 12px", border:`2px solid ${C.border}`,
                          background: writeInput.trim() ? C.border : "#3a3f2c",
                          color: writeInput.trim() ? "#f0ebd0" : "#79735a",
                          fontFamily:"'Special Elite',monospace", fontSize:12, fontWeight:700, letterSpacing:1.5,
                          cursor: writeInput.trim() ? "pointer" : "default" }}>
                        {t("game.btn.verify")}
                      </button>
                    )}
                  </div>
                ) : (
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
                )}
                {/* FIELD NOTE placeholder */}
                <div style={{ ...box(), padding:"11px 15px", marginTop:"auto", flexShrink:0 }}>
                  <div style={{ fontSize:10, letterSpacing:2, color:C.muted, textTransform:"uppercase",
                    borderBottom:`1px solid ${C.border}`, paddingBottom:4, marginBottom:8 }}>{t("game.field_note")}</div>
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
                  borderBottom:`1px solid ${C.border}`, paddingBottom:4, marginBottom:8 }}>{t("game.how_to_spot")}</div>
                <ul style={{ margin:0, padding:0, listStyle:"none", display:"flex", flexDirection:"column", gap:5 }}>
                  {(veh.spotting||[]).map((s,i) => (
                    <li key={i} style={{ fontSize:14, lineHeight:1.3, paddingLeft:16, position:"relative",
                      fontFamily:"'Special Elite',monospace" }}>
                      <span style={{ position:"absolute", left:0, top:0, color:accentColor, fontWeight:700 }}>›</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ ...box(), padding:"11px 15px", flexShrink:0 }}>
                <div style={{ fontSize:10, letterSpacing:2, color:C.muted, textTransform:"uppercase",
                  borderBottom:`1px solid ${C.border}`, paddingBottom:4, marginBottom:8 }}>{t("game.field_note")}</div>
                <p style={{ fontSize:14, lineHeight:1.35, fontFamily:"'Special Elite',monospace",
                  color:"#3a3a30", margin:0 }}>{veh.fact}</p>
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
          {picked == null
            ? (card.writeMode ? t("game.hud.type") : t("game.hud.pick"))
            : revealed ? t("game.hud.next")
            : t("game.hud.reveal")}
        </span>
        {/* Weight indicator */}
        <div style={{ flex:1, margin:"0 24px", display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ flex:1, height:6, background:"#1a1d12", border:"1px solid #4a4f3a" }}>
            <div style={{ height:"100%", background:accentColor,
              width:`${Math.min(100, (cardInfo.weight / 10) * 100)}%`,
              transition:"width 0.3s" }}/>
          </div>
          <span style={{ fontSize:9, opacity:0.5, letterSpacing:1 }}>{t("game.priority")}</span>
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
          {revealed ? t("game.btn.next") : picked != null ? t("game.btn.reveal") : t("game.btn.waiting")}
        </button>
      </div>
    </div>
  );
}

// ─── Report Modal ─────────────────────────────────────────────────
function ReportModal({ tankName, tankPhotoUrl }) {
  const { t } = useLang();
  const [open, setOpen]         = React.useState(false);
  const [issueType, setIssueType] = React.useState("Wrong image");
  const [description, setDesc]  = React.useState("");
  const [status, setStatus]     = React.useState(null); // null | "sending" | "ok" | "err"

  const submit = async () => {
    if (status === "sending") return;
    setStatus("sending");
    try {
      await window.supabase.from("bug_reports").insert({
        page: "quiz",
        tank_name: tankName || null,
        tank_photo_url: tankPhotoUrl || null,
        issue_type: issueType,
        description: description.trim() || null,
      });
      setStatus("ok");
      setTimeout(() => { setOpen(false); setStatus(null); setDesc(""); }, 1800);
    } catch(e) {
      setStatus("err");
    }
  };

  const overlayStyle = {
    position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:1000,
    display:"flex", alignItems:"center", justifyContent:"center",
  };
  const modalStyle = {
    background: C.panel, border:`2px solid ${C.border}`,
    boxShadow:`0 2px 0 ${C.border}, 0 8px 24px rgba(0,0,0,0.35)`,
    padding:"24px 28px", width:340, maxWidth:"90vw",
    fontFamily:"'Special Elite',monospace",
  };
  const labelStyle = { fontSize:10, letterSpacing:1.5, color:C.muted, display:"block", marginBottom:4 };
  const inputStyle = {
    width:"100%", boxSizing:"border-box", padding:"7px 10px",
    border:`2px solid ${C.border}`, background:C.bg,
    fontFamily:"'Special Elite',monospace", fontSize:13, color:C.border,
    outline:"none", marginBottom:14,
  };
  const btnStyle = (primary) => ({
    padding:"8px 14px", border:`2px solid ${C.border}`,
    background: primary ? C.border : "transparent",
    color: primary ? "#f0ebd0" : C.border,
    fontFamily:"'Special Elite',monospace", fontSize:11, fontWeight:700,
    letterSpacing:1.5, cursor:"pointer",
  });

  return (
    <React.Fragment>
      <button
        onClick={() => { setOpen(true); setStatus(null); }}
        style={{
          position:"fixed", bottom:14, right:14, zIndex:900,
          padding:"6px 12px", border:`2px solid ${C.border}`,
          background: C.panel, color:C.border, opacity:0.7,
          fontFamily:"'Special Elite',monospace", fontSize:10,
          letterSpacing:1.5, cursor:"pointer",
        }}
        title={t("bug.btn_tooltip")}
      >{t("bug.btn_label")}</button>

      {open && (
        <div style={overlayStyle} onClick={e => { if (e.target===e.currentTarget) setOpen(false); }}>
          <div style={modalStyle}>
            <div style={{ fontSize:13, fontWeight:700, letterSpacing:2, marginBottom:16,
              borderBottom:`1px dashed ${C.border}`, paddingBottom:10 }}>
              {t("bug.title")}
            </div>
            {tankName && (
              <div style={{ fontSize:11, color:C.muted, marginBottom:14, letterSpacing:0.5 }}>
                {t("bug.tank_label")} <span style={{ color:C.border }}>{tankName}</span>
              </div>
            )}
            <label style={labelStyle}>{t("bug.issue_type")}</label>
            <select
              value={issueType} onChange={e => setIssueType(e.target.value)}
              style={{ ...inputStyle }}
            >
              <option value="Wrong image">{t("bug.opt.wrong_image")}</option>
              <option value="Wrong name / designation">{t("bug.opt.wrong_name")}</option>
              <option value="Wrong stats">{t("bug.opt.wrong_stats")}</option>
              <option value="Other">{t("bug.opt.other")}</option>
            </select>
            <label style={labelStyle}>{t("bug.desc_label")}</label>
            <textarea
              value={description} onChange={e => setDesc(e.target.value)}
              rows={3} placeholder={t("bug.desc_placeholder")}
              style={{ ...inputStyle, resize:"vertical" }}
            />
            {status === "ok" && (
              <div style={{ color:C.green, fontSize:12, letterSpacing:1, marginBottom:12 }}>
                {t("bug.success")}
              </div>
            )}
            {status === "err" && (
              <div style={{ color:C.red, fontSize:12, letterSpacing:1, marginBottom:12 }}>
                {t("bug.error")}
              </div>
            )}
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
              <button style={btnStyle(false)} onClick={() => setOpen(false)}>{t("bug.cancel")}</button>
              <button style={btnStyle(true)} onClick={submit} disabled={status==="sending"}>
                {status==="sending" ? t("bug.sending") : t("bug.submit")}
              </button>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}

// ─── App ──────────────────────────────────────────────────────────
function App() {
  const { t } = useLang();
  const [ready, setReady]           = useState(false);
  const [card, setCard]             = useState(null);
  const [picked, setPicked]         = useState(null);
  const [revealed, setRevealed]     = useState(false);
  const [session, setSession]       = useState({ right: 0, wrong: 0, hardRight: 0, total: 0 });
  const [cardInfo, setCardInfo]     = useState(null);
  const [writeInput, setWriteInput] = useState("");

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
      const info = SRS.getCardInfo(t.name);
      const writeMode = info.streak >= 3 && Math.random() < 0.4;
      const hardMode = !writeMode && SRS.isHardMode(t.name);
      setCard(SRS.buildCard(t, hardMode, writeMode));
      setCardInfo(info);
      setSession(SRS.getSessionStats());
      setReady(true);
    })();
  }, []);

  const refreshSession = () => setSession(SRS.getSessionStats());

  const nextCard = useCallback(() => {
    if (!card) return;
    const next = SRS.pickNext(card.tank);
    const info = SRS.getCardInfo(next.name);
    const writeMode = info.streak >= 3 && Math.random() < 0.4;
    const hardMode = !writeMode && SRS.isHardMode(next.name);
    setCard(SRS.buildCard(next, hardMode, writeMode));
    setCardInfo(info);
    setPicked(null);
    setRevealed(false);
    setWriteInput("");
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

  const handleWriteSubmit = useCallback(() => {
    if (!card || picked != null || !writeInput.trim()) return;
    const correct = fuzzyMatch(writeInput, card.tank.name);
    if (correct) SRS.onCorrect(card.tank.name); else SRS.onWrong(card.tank.name);
    setCardInfo(SRS.getCardInfo(card.tank.name));
    setPicked(correct);
    refreshSession();
    saveProgress();
    document.activeElement?.blur();
  }, [card, picked, writeInput]);

  const handleAdvance = useCallback(() => {
    if (revealed) { nextCard(); return; }
    if (picked == null) {
      if (card.writeMode) return;
      SRS.onWrong(card.tank.name);
      setPicked(-1);
      setCardInfo(SRS.getCardInfo(card.tank.name));
      refreshSession();
      saveProgress();
    }
    setRevealed(true);
  }, [revealed, picked, card, nextCard]);

  // Keyboard: 1-4 pick choice, space/enter advance
  useEffect(() => {
    const handler = (e) => {
      if (e.key === " " || e.key === "Enter") {
        if (document.activeElement.tagName === "INPUT") return;
        e.preventDefault();
        handleAdvance();
      }
      if (["1","2","3","4"].includes(e.key)) {
        if (document.activeElement.tagName === "INPUT") return;
        handlePick(parseInt(e.key) - 1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleAdvance, handlePick]);

  if (!ready) return (
    <div className="stage" style={{ display:"flex", alignItems:"center", justifyContent:"center",
      color:"#e8e3c2", fontFamily:"'Special Elite',monospace", fontSize:11, letterSpacing:3 }}>
      {t("game.loading")}
    </div>
  );

  return (
    <div className="stage">
      <TankCard
        key={card.tank.name}
        card={card}
        cardInfo={cardInfo}
        picked={picked}
        revealed={revealed}
        onPick={handlePick}
        onAdvance={handleAdvance}
        session={session}
        writeInput={writeInput}
        onWriteInputChange={setWriteInput}
        onWriteSubmit={handleWriteSubmit}
      />
      <ReportModal tankName={card?.tank?.name} tankPhotoUrl={card?.tank?.photo} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <LanguageProvider><App /></LanguageProvider>
);
