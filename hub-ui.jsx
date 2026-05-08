// ─── Hub UI ───────────────────────────────────────────────────────
// Edit this file freely to restyle the start page.
// Account logic lives in accounts.js — don't touch that unless
// you're changing how accounts or progress work.
// ──────────────────────────────────────────────────────────────────
const { useState, useEffect, useRef } = React;

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

// ─── Tank image path ──────────────────────────────────────────────
function tankImagePath(name) {
  let s = name.toLowerCase();
  s = s.replace(/ä/g,"a").replace(/ö/g,"o").replace(/ü/g,"u").replace(/ß/g,"ss");
  s = s.replace(/\(t\)/g,"t").replace(/\(p\)/g,"p").replace(/\(h\)/g,"h");
  s = s.replace(/[^a-z0-9]+/g,"_").replace(/_+/g,"_").replace(/^_|_$/g,"");
  return "./images/" + s + ".jpg";
}

// ─── SVG silhouette fallback ──────────────────────────────────────
function TankSilhouette({ size = 60 }) {
  return (
    <div style={{ width:size, height:Math.round(size*0.75), background:"linear-gradient(180deg,#d8cf9c,#c4b78e)",
      display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <svg viewBox="0 0 220 80" width={size - 4} style={{ display:"block" }}>
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
    </div>
  );
}

// ─── Thumbnail with fallback ──────────────────────────────────────
function TankThumb({ name }) {
  const [err, setErr] = useState(false);
  useEffect(() => setErr(false), [name]);
  if (err) return <TankSilhouette size={60} />;
  return (
    <img src={tankImagePath(name)} alt=""
      style={{ width:60, height:45, objectFit:"cover", flexShrink:0,
        filter:"sepia(0.35) contrast(1.05) saturate(0.85)" }}
      onError={() => setErr(true)} />
  );
}

// ─── Search filtering ─────────────────────────────────────────────
function filterTanks(query) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const matches = (window.TANKS || []).filter(t =>
    t.name.toLowerCase().includes(q) ||
    (t.nation||"").toLowerCase().includes(q) ||
    (t.family||"").toLowerCase().includes(q) ||
    (t.nickname||"").toLowerCase().includes(q) ||
    (t.type||"").toLowerCase().includes(q) ||
    (t.era||"").toLowerCase().includes(q) ||
    (t.tags||[]).join(" ").toLowerCase().includes(q) ||
    (t.br||"").toLowerCase().includes(q) ||
    (t.rank||"").toLowerCase().includes(q) ||
    (t.gun||"").toLowerCase().includes(q)
  );
  matches.sort((a, b) => {
    const an = a.name.toLowerCase(), bn = b.name.toLowerCase();
    if (an === q && bn !== q) return -1;
    if (bn === q && an !== q) return 1;
    if (an.startsWith(q) && !bn.startsWith(q)) return -1;
    if (bn.startsWith(q) && !an.startsWith(q)) return 1;
    return 0;
  });
  return matches.slice(0, 30);
}

// ─── Tank Detail Modal ────────────────────────────────────────────
function TankDetailModal({ tank, onClose }) {
  const [imgErr, setImgErr] = useState(false);
  useEffect(() => {
    setImgErr(false);
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [tank]);

  const dossierFields = [
    ["ORIGIN", tank.nation],
    ["YEAR", String(tank.year)],
    ["CREW", String(tank.crew)],
    ["MAIN GUN", tank.gun],
    ["ERA", tank.era],
    ["TYPE", tank.type],
    ["FAMILY", tank.family],
    ["BATTLE RATING", tank.br],
    ["RANK", tank.rank],
    ["NICKNAME", tank.nickname],
  ];

  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, background:"rgba(28,28,20,0.88)",
      display:"flex", alignItems:"center", justifyContent:"center",
      zIndex:1000, padding:20, overflowY:"auto" }}>
      <div onClick={e => e.stopPropagation()} style={{
        ...box(), width:"100%", maxWidth:860, maxHeight:"90vh",
        display:"flex", flexDirection:"column", overflow:"hidden",
        background:`linear-gradient(180deg,${C.bg} 0%,${C.bgDark} 100%)` }}>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"10px 20px", background:C.top, color:C.topFg,
          borderBottom:"3px double #1a1d12", flexShrink:0 }}>
          <span style={{ fontSize:11, letterSpacing:2.5, textTransform:"uppercase" }}>
            CLASSIFIED VEHICLE DOSSIER
          </span>
          <button onClick={onClose} style={{
            background:"transparent", border:`1px solid ${C.topFg}`,
            color:C.topFg, fontSize:10, letterSpacing:1.5, padding:"3px 10px", cursor:"pointer" }}>
            CLOSE DOSSIER ×
          </button>
        </div>

        <div style={{ display:"flex", gap:20, padding:20, flex:1, overflow:"auto", minHeight:0 }}>
          <div style={{ flex:"0 0 55%", display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ ...box(), overflow:"hidden" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                padding:"7px 14px", borderBottom:`1px solid ${C.border}`,
                fontSize:10, letterSpacing:1.5, color:C.muted, background:C.paper }}>
                <span>FIG. A — IDENTIFICATION PLATE</span>
                <span>{(tank.nation||"").toUpperCase()} · {tank.year}</span>
              </div>
              <div style={{ height:200, background:"#3a3a30", display:"flex",
                alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
                {imgErr
                  ? <TankSilhouette size={220} />
                  : <img src={tankImagePath(tank.name)} alt={tank.name}
                      style={{ width:"100%", height:"100%", objectFit:"cover",
                        filter:"sepia(0.35) contrast(1.05) saturate(0.85)" }}
                      onError={() => setImgErr(true)} />}
                <div style={{ position:"absolute", top:30, right:20,
                  border:`3px solid ${C.green}`, color:C.green,
                  padding:"4px 14px", transform:"rotate(-8deg)",
                  fontSize:14, letterSpacing:2, fontWeight:700,
                  fontFamily:"'Special Elite',monospace",
                  opacity:0.85, background:"rgba(251,246,225,0.4)" }}>
                  IDENTIFIED
                </div>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", padding:"5px 14px",
                fontSize:10, letterSpacing:1.5, color:C.muted,
                borderTop:`1px solid ${C.border}`, background:C.paper }}>
                <span>SIDE VIEW · FIELD MANUAL</span>
                <span>SCALE 1:60</span>
              </div>
            </div>

            <div style={{ ...box(), padding:"12px 18px" }}>
              <div style={{ fontSize:10, letterSpacing:2, color:C.muted, marginBottom:4 }}>DESIGNATION</div>
              <div style={{ fontSize:22, fontWeight:700, letterSpacing:1 }}>{tank.name.toUpperCase()}</div>
            </div>

            {tank.tags && tank.tags.length > 0 && (
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {tank.tags.map(tag => (
                  <span key={tag} style={{ fontSize:9, letterSpacing:1.5, padding:"2px 8px",
                    border:`1px solid ${C.muted}`, color:C.muted, textTransform:"uppercase" }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ flex:"1 1 45%", display:"flex", flexDirection:"column", gap:12, minWidth:0 }}>
            <div style={{ ...box(), padding:"12px 18px" }}>
              <div style={{ fontSize:10, letterSpacing:2, color:C.muted, textTransform:"uppercase",
                borderBottom:`1px solid ${C.border}`, paddingBottom:4, marginBottom:10 }}>DOSSIER</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px 14px" }}>
                {dossierFields.map(([k, v]) => (
                  <div key={k} style={{ display:"flex", flexDirection:"column", gap:2 }}>
                    <div style={{ fontSize:9, letterSpacing:1.5, color:C.muted, textTransform:"uppercase" }}>{k}</div>
                    <div style={{ fontSize:13, fontWeight:700, letterSpacing:0.5 }}>{v || "—"}</div>
                  </div>
                ))}
              </div>
            </div>

            {tank.spotting && tank.spotting.length > 0 && (
              <div style={{ ...box(), padding:"11px 15px", flex:1 }}>
                <div style={{ fontSize:10, letterSpacing:2, color:C.muted, textTransform:"uppercase",
                  borderBottom:`1px solid ${C.border}`, paddingBottom:4, marginBottom:8 }}>HOW TO SPOT IT</div>
                <ul style={{ margin:0, padding:0, listStyle:"none", display:"flex", flexDirection:"column", gap:6 }}>
                  {tank.spotting.map((s, i) => (
                    <li key={i} style={{ fontSize:13, lineHeight:1.35, paddingLeft:16, position:"relative" }}>
                      <span style={{ position:"absolute", left:0, top:0, color:C.red, fontWeight:700 }}>›</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tank.fact && (
              <div style={{ ...box(), padding:"11px 15px", flexShrink:0 }}>
                <div style={{ fontSize:10, letterSpacing:2, color:C.muted, textTransform:"uppercase",
                  borderBottom:`1px solid ${C.border}`, paddingBottom:4, marginBottom:8 }}>FIELD NOTE</div>
                <p style={{ fontSize:13, lineHeight:1.4, margin:0, color:"#3a3a30" }}>{tank.fact}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Search Panel ─────────────────────────────────────────────────
function SearchPanel() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const results = filterTanks(query);
  const showNoResults = query.trim().length >= 2 && results.length === 0;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        autoFocus
        placeholder="Search by name, nation, type, era, BR…"
        style={{
          background:C.panel, border:`2px solid ${C.border}`, color:C.border,
          fontSize:14, padding:"10px 14px", width:"100%", outline:"none", letterSpacing:0.5,
        }}
        onFocus={e => e.target.style.boxShadow = `0 0 0 2px ${C.amber}`}
        onBlur={e => e.target.style.boxShadow = "none"}
      />

      {(results.length > 0 || showNoResults) && (
        <div style={{ ...box(), overflow:"hidden" }}>
          {showNoResults ? (
            <div style={{ padding:"20px 18px", textAlign:"center" }}>
              <div style={{ fontSize:14, color:C.red, letterSpacing:2,
                border:`2px solid ${C.red}`, display:"inline-block",
                padding:"6px 18px", transform:"rotate(-2deg)", fontWeight:700 }}>
                NO RECORDS FOUND
              </div>
            </div>
          ) : (
            <div style={{ maxHeight:420, overflowY:"auto" }}>
              {results.map((tank, idx) => (
                <button key={tank.name} onClick={() => setSelected(tank)}
                  style={{
                    width:"100%", display:"flex", alignItems:"center", gap:12,
                    padding:"8px 14px", background:idx % 2 === 0 ? C.panel : C.paper,
                    border:"none", borderBottom:`1px solid ${C.border}`,
                    cursor:"pointer", textAlign:"left", transition:"background 0.1s",
                  }}
                  onMouseOver={e => e.currentTarget.style.background = C.bgDark}
                  onMouseOut={e => e.currentTarget.style.background = idx % 2 === 0 ? C.panel : C.paper}>
                  <TankThumb name={tank.name} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:700, letterSpacing:0.5,
                      whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                      {tank.name.toUpperCase()}
                    </div>
                    <div style={{ fontSize:10, letterSpacing:1, color:C.muted, marginTop:2 }}>
                      {[tank.nation, tank.era, tank.type].filter(Boolean).join(" · ").toUpperCase()}
                    </div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", flexShrink:0, gap:2 }}>
                    <div style={{ fontSize:11, fontWeight:700, letterSpacing:1 }}>BR {tank.br}</div>
                    <div style={{ fontSize:10, color:C.muted, letterSpacing:1 }}>RANK {tank.rank}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {selected && <TankDetailModal tank={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

// ─── Input field ──────────────────────────────────────────────────
function Field({ label, value, onChange, type = "text", autoFocus = false }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      <div style={{ fontSize:9, letterSpacing:2, color:C.muted, textTransform:"uppercase" }}>{label}</div>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoFocus={autoFocus}
        style={{
          background:C.panel, border:`2px solid ${C.border}`, color:C.border,
          fontSize:14, padding:"9px 12px", width:"100%", outline:"none", letterSpacing:0.5,
        }}
        onFocus={e => e.target.style.boxShadow = `0 0 0 2px ${C.amber}`}
        onBlur={e => e.target.style.boxShadow = "none"}
      />
    </div>
  );
}

// ─── Enlist View ──────────────────────────────────────────────────
function EnlistView({ onBack }) {
  const [nick, setNick]       = useState("");
  const [pass, setPass]       = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!nick.trim()) return setError("CALLSIGN REQUIRED");
    if (nick.trim().length < 3) return setError("CALLSIGN TOO SHORT — MINIMUM 3 CHARACTERS");
    if (nick.trim().length > 20) return setError("CALLSIGN TOO LONG — MAXIMUM 20 CHARACTERS");
    if (!/^[A-Za-z0-9_\-\.]+$/.test(nick.trim())) return setError("INVALID CALLSIGN — LETTERS, NUMBERS, AND _ - . ONLY");
    if (await Accounts.isNicknameTaken(nick.trim())) return setError("CALLSIGN ALREADY CLAIMED — CHOOSE ANOTHER");
    if (!pass) return setError("AUTHENTICATION CODE REQUIRED");
    if (pass.length < 6) return setError("AUTHENTICATION CODE TOO SHORT — MINIMUM 6 CHARACTERS");
    if (pass !== confirm) return setError("AUTHENTICATION CODES DO NOT MATCH");

    setLoading(true);
    await Accounts.create(nick.trim(), pass);
    window.location.href = "Tank Flashcards.html";
  }

  return (
    <div style={{ maxWidth:460, margin:"0 auto", width:"100%" }}>
      <div style={{ ...box(), padding:"24px 28px" }}>
        <div style={{ fontSize:10, letterSpacing:2.5, color:C.muted, textTransform:"uppercase",
          borderBottom:`1px solid ${C.border}`, paddingBottom:10, marginBottom:20 }}>
          PERSONNEL ENLISTMENT — NEW RECRUIT
        </div>
        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Field label="ASSIGN CALLSIGN (NICKNAME)" value={nick} onChange={setNick} autoFocus />
          <Field label="SET AUTHENTICATION CODE (PASSWORD)" value={pass} onChange={setPass} type="password" />
          <Field label="CONFIRM AUTHENTICATION CODE" value={confirm} onChange={setConfirm} type="password" />

          {error && (
            <div style={{ fontSize:11, color:C.red, letterSpacing:1.5, fontWeight:700,
              padding:"6px 10px", border:`1px solid ${C.red}`, background:"rgba(196,69,47,0.06)" }}>
              ⚠ {error}
            </div>
          )}

          <div style={{ display:"flex", gap:10, marginTop:4 }}>
            <button type="button" onClick={onBack}
              style={{ flex:1, padding:"12px 0", background:"transparent",
                border:`2px solid ${C.border}`, color:C.border,
                fontSize:11, letterSpacing:2, fontWeight:700, cursor:"pointer" }}>
              ← STAND DOWN
            </button>
            <button type="submit" disabled={loading}
              style={{ flex:2, padding:"12px 0", background: loading ? C.muted : C.green,
                border:`2px solid ${C.border}`, color:"#f0ebd0",
                fontSize:12, letterSpacing:2.5, fontWeight:700,
                cursor: loading ? "default" : "pointer", transition:"background 0.15s" }}>
              {loading ? "PROCESSING…" : "ENLIST NOW →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Report View ──────────────────────────────────────────────────
function ReportView({ onBack }) {
  const [nick, setNick]   = useState("");
  const [pass, setPass]   = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!nick.trim()) return setError("CALLSIGN REQUIRED");
    if (!pass) return setError("AUTHENTICATION CODE REQUIRED");

    setLoading(true);
    const ok = await Accounts.login(nick.trim(), pass);
    if (!ok) {
      setLoading(false);
      const exists = await Accounts.isNicknameTaken(nick.trim());
      return setError(exists ? "AUTHENTICATION FAILED — CHECK YOUR CODE" : "CALLSIGN NOT RECOGNISED — ENLIST FIRST");
    }
    window.location.href = "Tank Flashcards.html";
  }

  return (
    <div style={{ maxWidth:460, margin:"0 auto", width:"100%" }}>
      <div style={{ ...box(), padding:"24px 28px" }}>
        <div style={{ fontSize:10, letterSpacing:2.5, color:C.muted, textTransform:"uppercase",
          borderBottom:`1px solid ${C.border}`, paddingBottom:10, marginBottom:20 }}>
          PERSONNEL AUTHENTICATION — REPORT FOR DUTY
        </div>
        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Field label="CALLSIGN" value={nick} onChange={setNick} autoFocus />
          <Field label="AUTHENTICATION CODE" value={pass} onChange={setPass} type="password" />

          {error && (
            <div style={{ fontSize:11, color:C.red, letterSpacing:1.5, fontWeight:700,
              padding:"6px 10px", border:`1px solid ${C.red}`, background:"rgba(196,69,47,0.06)" }}>
              ⚠ {error}
            </div>
          )}

          <div style={{ display:"flex", gap:10, marginTop:4 }}>
            <button type="button" onClick={onBack}
              style={{ flex:1, padding:"12px 0", background:"transparent",
                border:`2px solid ${C.border}`, color:C.border,
                fontSize:11, letterSpacing:2, fontWeight:700, cursor:"pointer" }}>
              ← STAND DOWN
            </button>
            <button type="submit" disabled={loading}
              style={{ flex:2, padding:"12px 0", background: loading ? C.muted : C.top,
                border:`2px solid ${C.border}`, color:C.topFg,
                fontSize:11, letterSpacing:2, fontWeight:700,
                cursor: loading ? "default" : "pointer", transition:"background 0.15s" }}>
              {loading ? "VERIFYING…" : "REPORT FOR DUTY →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Mission Select View ──────────────────────────────────────────
function MissionView({ onBack }) {
  const allNations = [...new Set((window.TANKS || []).map(t => t.nation).filter(Boolean))].sort();
  const allEras    = [...new Set((window.TANKS || []).map(t => t.era).filter(Boolean))].sort();

  const [nations, setNations] = useState(new Set(allNations));
  const [eras, setEras]       = useState(new Set(allEras));
  const [authError, setAuthError] = useState(false);

  function toggleNation(n) {
    setNations(prev => {
      const next = new Set(prev);
      next.has(n) ? next.delete(n) : next.add(n);
      return next;
    });
  }

  function toggleEra(e) {
    setEras(prev => {
      const next = new Set(prev);
      next.has(e) ? next.delete(e) : next.add(e);
      return next;
    });
  }

  const matchCount = (window.TANKS || []).filter(t =>
    nations.has(t.nation) && eras.has(t.era)
  ).length;

  function handleDeploy() {
    if (!Accounts.isValidSession()) { setAuthError(true); return; }
    const filter = {
      nations: [...nations],
      eras:    [...eras],
    };
    sessionStorage.setItem("ankitank_custom_filter", JSON.stringify(filter));
    window.location.href = "Tank Flashcards.html";
  }

  const btnBase = (active) => ({
    padding:"7px 14px", fontSize:10, letterSpacing:1.5, fontWeight:700,
    border:`2px solid ${C.border}`, cursor:"pointer", transition:"background 0.1s",
    background: active ? C.top : C.panel,
    color:      active ? C.topFg : C.border,
    boxShadow:  active ? `0 2px 0 ${C.border}` : "none",
  });

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:0, height:"100%" }}>
      {/* header */}
      <div style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 20px",
        borderBottom:`2px solid ${C.border}`, flexShrink:0 }}>
        <button onClick={onBack} style={{ ...btnBase(false), padding:"6px 12px", fontSize:10 }}>
          ← BACK
        </button>
        <div>
          <div style={{ fontSize:10, letterSpacing:2.5, color:C.muted, textTransform:"uppercase" }}>
            MISSION SELECT — CONFIGURE DEPLOYMENT
          </div>
          <div style={{ fontSize:12, fontWeight:700, letterSpacing:1, marginTop:2 }}>
            {matchCount} VEHICLE{matchCount !== 1 ? "S" : ""} IN POOL
          </div>
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"18px 20px", display:"flex", flexDirection:"column", gap:18 }}>

        {/* Nation filter */}
        <div style={{ ...box(), padding:"14px 16px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
            borderBottom:`1px solid ${C.border}`, paddingBottom:8, marginBottom:12 }}>
            <div style={{ fontSize:10, letterSpacing:2, color:C.muted, textTransform:"uppercase" }}>NATIONS</div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => setNations(new Set(allNations))}
                style={{ ...btnBase(false), padding:"3px 10px", fontSize:9 }}>ALL</button>
              <button onClick={() => setNations(new Set())}
                style={{ ...btnBase(false), padding:"3px 10px", fontSize:9 }}>NONE</button>
            </div>
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {allNations.map(n => (
              <button key={n} onClick={() => toggleNation(n)} style={btnBase(nations.has(n))}>
                {n.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Era filter */}
        <div style={{ ...box(), padding:"14px 16px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
            borderBottom:`1px solid ${C.border}`, paddingBottom:8, marginBottom:12 }}>
            <div style={{ fontSize:10, letterSpacing:2, color:C.muted, textTransform:"uppercase" }}>ERA</div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => setEras(new Set(allEras))}
                style={{ ...btnBase(false), padding:"3px 10px", fontSize:9 }}>ALL</button>
              <button onClick={() => setEras(new Set())}
                style={{ ...btnBase(false), padding:"3px 10px", fontSize:9 }}>NONE</button>
            </div>
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {allEras.map(e => (
              <button key={e} onClick={() => toggleEra(e)} style={btnBase(eras.has(e))}>
                {e.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {authError && (
          <div style={{ fontSize:11, color:C.red, letterSpacing:1.5, fontWeight:700,
            padding:"8px 12px", border:`1px solid ${C.red}`, background:"rgba(196,69,47,0.06)" }}>
            ⚠ MUST ENLIST OR REPORT FOR DUTY BEFORE DEPLOYING
          </div>
        )}
      </div>

      {/* Deploy footer */}
      <div style={{ padding:"14px 20px", borderTop:`2px solid ${C.border}`, flexShrink:0,
        background:C.bgDark, display:"flex", alignItems:"center", gap:14 }}>
        {matchCount < 4 && (
          <div style={{ fontSize:10, color:C.red, letterSpacing:1, flex:1 }}>
            SELECT AT LEAST 4 VEHICLES TO DEPLOY
          </div>
        )}
        <button onClick={handleDeploy} disabled={matchCount < 4}
          style={{ marginLeft:"auto", padding:"12px 28px",
            background: matchCount >= 4 ? C.green : C.muted,
            border:`2px solid ${C.border}`, color:"#f0ebd0",
            fontSize:12, letterSpacing:2.5, fontWeight:700,
            cursor: matchCount >= 4 ? "pointer" : "default",
            boxShadow: matchCount >= 4 ? `0 2px 0 ${C.border}` : "none",
            transition:"background 0.15s" }}>
          DEPLOY →
        </button>
      </div>
    </div>
  );
}

// ─── Search View ──────────────────────────────────────────────────
function SearchView({ onBack }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:0, height:"100%" }}>
      <div style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 20px",
        borderBottom:`2px solid ${C.border}`, flexShrink:0 }}>
        <button onClick={onBack}
          style={{ padding:"6px 12px", fontSize:10, letterSpacing:1.5, fontWeight:700,
            border:`2px solid ${C.border}`, cursor:"pointer", background:C.panel, color:C.border }}>
          ← BACK
        </button>
        <div style={{ fontSize:10, letterSpacing:2.5, color:C.muted, textTransform:"uppercase" }}>
          INTEL DATABASE — VEHICLE SEARCH
        </div>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"18px 20px" }}>
        <SearchPanel />
      </div>
    </div>
  );
}

// ─── Leaderboard View ─────────────────────────────────────────────
function LeaderboardView({ onBack }) {
  const [rows, setRows] = useState([]);
  const currentUser = Accounts.getCurrent();
  useEffect(() => { Accounts.getLeaderboard().then(setRows); }, []);

  const medal = ["★", "✦", "◆"];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:0, height:"100%" }}>
      <div style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 20px",
        borderBottom:`2px solid ${C.border}`, flexShrink:0 }}>
        <button onClick={onBack}
          style={{ padding:"6px 12px", fontSize:10, letterSpacing:1.5, fontWeight:700,
            border:`2px solid ${C.border}`, cursor:"pointer", background:C.panel, color:C.border }}>
          ← BACK
        </button>
        <div style={{ fontSize:10, letterSpacing:2.5, color:C.muted, textTransform:"uppercase" }}>
          THEATER STANDINGS — LEADERBOARD
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"18px 20px" }}>
        {rows.length === 0 ? (
          <div style={{ textAlign:"center", marginTop:40 }}>
            <div style={{ fontSize:14, color:C.muted, letterSpacing:2,
              border:`2px solid ${C.muted}`, display:"inline-block",
              padding:"8px 20px", fontWeight:700 }}>
              NO OPERATIVES ON RECORD
            </div>
          </div>
        ) : (
          <div style={{ ...box(), overflow:"hidden" }}>
            {/* Table header */}
            <div style={{ display:"grid", gridTemplateColumns:"40px 1fr 90px 80px 90px",
              padding:"8px 14px", background:C.top, color:C.topFg,
              fontSize:9, letterSpacing:2, textTransform:"uppercase",
              borderBottom:`2px solid ${C.border}` }}>
              <div>#</div>
              <div>CALLSIGN</div>
              <div style={{ textAlign:"right" }}>SCORE</div>
              <div style={{ textAlign:"right" }}>ACCURACY</div>
              <div style={{ textAlign:"right" }}>MASTERED</div>
            </div>

            {rows.map((row, idx) => {
              const isMe = row.nickname === currentUser;
              return (
                <div key={row.nickname} style={{
                  display:"grid", gridTemplateColumns:"40px 1fr 90px 80px 90px",
                  padding:"10px 14px", alignItems:"center",
                  background: isMe ? C.amber : idx % 2 === 0 ? C.panel : C.paper,
                  borderBottom:`1px solid ${C.border}`,
                  color: isMe ? "#1a1a14" : C.border,
                }}>
                  <div style={{ fontSize:14, fontWeight:700, color: idx < 3 ? C.red : C.muted }}>
                    {idx < 3 ? medal[idx] : idx + 1}
                  </div>
                  <div style={{ fontSize:14, fontWeight:700, letterSpacing:0.5 }}>
                    {row.nickname.toUpperCase()}
                    {isMe && (
                      <span style={{ fontSize:9, letterSpacing:1.5, marginLeft:8,
                        opacity:0.7, fontWeight:400 }}>YOU</span>
                    )}
                  </div>
                  <div style={{ textAlign:"right", fontSize:15, fontWeight:700 }}>
                    {row.totalRight.toLocaleString()}
                  </div>
                  <div style={{ textAlign:"right", fontSize:13, fontWeight:700,
                    color: row.accuracy >= 70 ? C.green : row.accuracy >= 50 ? (isMe ? "#1c1c14" : C.amber) : C.red }}>
                    {row.totalRight + row.totalWrong > 0 ? row.accuracy + "%" : "—"}
                  </div>
                  <div style={{ textAlign:"right", fontSize:13, fontWeight:700 }}>
                    {row.mastered}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop:14, display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
          {[["SCORE", "Total correct answers"], ["ACCURACY", "% of correct over all attempts"], ["MASTERED", "Vehicles with 3+ consecutive correct"]].map(([label, desc]) => (
            <div key={label} style={{ ...box(), padding:"10px 12px" }}>
              <div style={{ fontSize:9, letterSpacing:2, color:C.muted, textTransform:"uppercase" }}>{label}</div>
              <div style={{ fontSize:11, color:C.muted, marginTop:3, lineHeight:1.3 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Top Bar ──────────────────────────────────────────────────────
function TopBar() {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"12px 28px", background:C.top, color:C.topFg,
      borderBottom:"3px double #1a1d12", flexShrink:0 }}>
      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
        <div style={{ width:32, height:32, background:C.red, color:"#f0ebd0",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:18, fontWeight:700, border:"2px solid #1a1d12" }}>★</div>
        <div>
          <div style={{ fontSize:18, letterSpacing:2, fontWeight:700 }}>ARMOR ID</div>
          <div style={{ fontSize:10, letterSpacing:1, opacity:0.65 }}>FIELD TRAINING DECK · WWII → PRESENT</div>
        </div>
      </div>
      <div style={{ fontSize:10, letterSpacing:2, opacity:0.6, textTransform:"uppercase" }}>
        CLASSIFIED PERSONNEL DOSSIER
      </div>
    </div>
  );
}

// ─── Page wrapper (shared background + grain) ─────────────────────
function PageWrap({ children, padded = false }) {
  return (
    <div style={{ background:`linear-gradient(180deg,${C.bg} 0%,${C.bgDark} 100%)`,
      minHeight:"100%", display:"flex", flexDirection:"column" }}>
      <div style={{ position:"fixed", inset:0, pointerEvents:"none",
        backgroundImage:"radial-gradient(rgba(120,90,30,0.06) 1px,transparent 1px)",
        backgroundSize:"3px 3px", mixBlendMode:"multiply", zIndex:0 }}/>
      {children}
    </div>
  );
}

// ─── Hub View ─────────────────────────────────────────────────────
function HubView({ onEnlist, onReport, onMission, onSearch, onLeaderboard }) {
  const currentUser = Accounts.getCurrent();
  const isValid = Accounts.isValidSession();
  const [noAuthMsg, setNoAuthMsg] = useState(false);

  function handleQuickStart() {
    if (!isValid) { setNoAuthMsg(true); return; }
    window.location.href = "Tank Flashcards.html";
  }

  const menuBtn = (label, sub, onClick, accent = C.top) => (
    <button onClick={onClick}
      style={{ padding:"22px 16px", background:accent, color:accent === C.top ? C.topFg : "#f0ebd0",
        border:`2px solid ${C.border}`, boxShadow:`0 2px 0 ${C.border}`,
        display:"flex", flexDirection:"column", alignItems:"flex-start", gap:4,
        cursor:"pointer", textAlign:"left", transition:"filter 0.12s" }}
      onMouseOver={e => e.currentTarget.style.filter = "brightness(1.12)"}
      onMouseOut={e => e.currentTarget.style.filter = "none"}>
      <div style={{ fontSize:13, letterSpacing:2.5, fontWeight:700 }}>{label}</div>
      {sub && <div style={{ fontSize:9, letterSpacing:1.5, opacity:0.65, textTransform:"uppercase" }}>{sub}</div>}
    </button>
  );

  return (
    <PageWrap>
      <TopBar />
      <div style={{ flex:1, padding:"32px 28px 40px", maxWidth:720, width:"100%",
        margin:"0 auto", display:"flex", flexDirection:"column", gap:24, position:"relative", zIndex:1 }}>

        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:11, letterSpacing:4, color:C.muted, textTransform:"uppercase", marginBottom:6 }}>
            FIELD TRAINING — VEHICLE IDENTIFICATION PROGRAM
          </div>
          <div style={{ borderTop:"3px double #1c1c14", marginTop:10 }} />
        </div>

        {isValid ? (
          <div style={{ background:C.amber, border:`2px solid ${C.border}`,
            boxShadow:`0 2px 0 ${C.border}`,
            display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"12px 18px" }}>
            <div>
              <div style={{ fontSize:9, letterSpacing:2.5, color:"#1a1a14", opacity:0.7,
                textTransform:"uppercase", marginBottom:3 }}>ACTIVE OPERATIVE</div>
              <div style={{ fontSize:16, fontWeight:700, letterSpacing:1, color:"#1a1a14" }}>
                {currentUser.toUpperCase()}
              </div>
            </div>
            <button
              onClick={async () => { await Accounts.logout(); window.location.reload(); }}
              style={{ background:"transparent", border:`1px solid #1a1a14`, color:"#1a1a14",
                fontSize:9, letterSpacing:1.5, padding:"4px 10px", cursor:"pointer", opacity:0.6 }}>
              LOG OUT
            </button>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <button onClick={onEnlist}
              style={{ padding:"14px 0", background:C.green, color:"#f0ebd0",
                border:`2px solid ${C.border}`, boxShadow:`0 2px 0 ${C.border}`,
                fontSize:12, letterSpacing:2.5, fontWeight:700, cursor:"pointer", transition:"filter 0.12s" }}
              onMouseOver={e => e.currentTarget.style.filter = "brightness(1.12)"}
              onMouseOut={e => e.currentTarget.style.filter = "none"}>
              ENLIST
            </button>
            <button onClick={onReport}
              style={{ padding:"14px 0", background:C.top, color:C.topFg,
                border:`2px solid ${C.border}`, boxShadow:`0 2px 0 ${C.border}`,
                fontSize:11, letterSpacing:2, fontWeight:700, cursor:"pointer", transition:"filter 0.12s" }}
              onMouseOver={e => e.currentTarget.style.filter = "brightness(1.12)"}
              onMouseOut={e => e.currentTarget.style.filter = "none"}>
              REPORT FOR DUTY
            </button>
          </div>
        )}

        {noAuthMsg && (
          <div style={{ fontSize:11, color:C.red, letterSpacing:1.5, fontWeight:700,
            padding:"8px 12px", border:`1px solid ${C.red}`, background:"rgba(196,69,47,0.06)" }}>
            ⚠ MUST ENLIST OR REPORT FOR DUTY BEFORE DEPLOYING
          </div>
        )}

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          {menuBtn("QUICK DEPLOYMENT", "All vehicles · start immediately", handleQuickStart, C.top)}
          {menuBtn("MISSION SELECT", "Choose nations & eras", onMission, C.green)}
          {menuBtn("INTEL DATABASE", "Search vehicle records", onSearch, C.top)}
          {menuBtn("THEATER STANDINGS", "Leaderboard", onLeaderboard, C.top)}
        </div>

      </div>
    </PageWrap>
  );
}

// ─── Subpage wrapper (TopBar + scrollable content) ────────────────
function SubPage({ children }) {
  return (
    <PageWrap>
      <TopBar />
      <div style={{ flex:1, display:"flex", flexDirection:"column", position:"relative", zIndex:1,
        maxWidth:720, width:"100%", margin:"0 auto", minHeight:0 }}>
        {children}
      </div>
    </PageWrap>
  );
}

// ─── App ──────────────────────────────────────────────────────────
function App() {
  const [view, setView] = useState("hub");
  const [ready, setReady] = useState(false);

  useEffect(() => { Accounts.init().then(() => setReady(true)); }, []);

  if (!ready) return (
    <div style={{ color:"#e8e3c2", textAlign:"center", padding:60,
      fontFamily:"'Special Elite',monospace", fontSize:11, letterSpacing:3 }}>
      LOADING INTEL...
    </div>
  );

  return (
    <div style={{ width:"100%", maxWidth:800, minHeight:"calc(100vh - 40px)",
      display:"flex", flexDirection:"column" }}>
      {view === "hub" && (
        <HubView
          onEnlist={() => setView("enlist")}
          onReport={() => setView("report")}
          onMission={() => setView("mission")}
          onSearch={() => setView("search")}
          onLeaderboard={() => setView("leaderboard")}
        />
      )}
      {view === "enlist" && (
        <SubPage>
          <div style={{ flex:1, padding:"40px 28px", overflowY:"auto" }}>
            <EnlistView onBack={() => setView("hub")} />
          </div>
        </SubPage>
      )}
      {view === "report" && (
        <SubPage>
          <div style={{ flex:1, padding:"40px 28px", overflowY:"auto" }}>
            <ReportView onBack={() => setView("hub")} />
          </div>
        </SubPage>
      )}
      {view === "mission" && (
        <SubPage>
          <MissionView onBack={() => setView("hub")} />
        </SubPage>
      )}
      {view === "search" && (
        <SubPage>
          <SearchView onBack={() => setView("hub")} />
        </SubPage>
      )}
      {view === "leaderboard" && (
        <SubPage>
          <LeaderboardView onBack={() => setView("hub")} />
        </SubPage>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
