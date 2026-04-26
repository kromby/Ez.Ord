// Direction 3 — "Leikur"
// Bright pop. Chunky meeple/dice energy. Saturated blocks, white backgrounds,
// thick black outlines, playful tilts. Type: heavy grotesk + chunky display.

const LeikTokens = {
  bg: '#fffaf0',
  bgPanel: '#fff3d6',
  ink: '#0e0e10',
  inkSoft: '#5a5a5e',
  white: '#ffffff',
  red: '#ef4127',
  yellow: '#ffc832',
  blue: '#2563ff',
  green: '#1fb265',
  pink: '#ff6cab',
  purple: '#7a3ff2',
  font: '"Familjen Grotesk", "Inter", system-ui, sans-serif',
  display: '"Familjen Grotesk", "Inter", system-ui, sans-serif',
  mono: '"DM Mono", ui-monospace, monospace',
};

// Outlined chunky tile.
function PopTile({ children, color = LeikTokens.white, fg = LeikTokens.ink, depth = 5, tilt = 0, onClick, selected = false, style = {}, radius = 16 }) {
  return (
    <div onClick={onClick} style={{
      background: color, color: fg,
      borderRadius: radius,
      border: `2.5px solid ${LeikTokens.ink}`,
      boxShadow: selected
        ? `0 0 0 4px ${LeikTokens.yellow}, 0 0 0 6.5px ${LeikTokens.ink}, ${depth}px ${depth}px 0 ${LeikTokens.ink}`
        : `${depth}px ${depth}px 0 ${LeikTokens.ink}`,
      transform: tilt ? `rotate(${tilt}deg)` : 'none',
      cursor: onClick ? 'pointer' : 'default',
      position: 'relative',
      ...style,
    }}>{children}</div>
  );
}

// Die face with N pips.
function DieFace({ n = 1, size = 28, bg = LeikTokens.white, fg = LeikTokens.ink }) {
  const positions = {
    1: [[1,1]],
    2: [[0,0],[2,2]],
    3: [[0,0],[1,1],[2,2]],
    4: [[0,0],[2,0],[0,2],[2,2]],
    5: [[0,0],[2,0],[1,1],[0,2],[2,2]],
    6: [[0,0],[2,0],[0,1],[2,1],[0,2],[2,2]],
  }[n] || [];
  const pad = size * 0.18;
  const cell = (size - pad * 2) / 2;
  return (
    <div style={{
      width: size, height: size, background: bg,
      border: `2px solid ${LeikTokens.ink}`, borderRadius: size * 0.18,
      position: 'relative', flexShrink: 0,
    }}>
      {positions.map(([x,y], i) => (
        <span key={i} style={{
          position: 'absolute',
          width: size * 0.16, height: size * 0.16, borderRadius: 999, background: fg,
          left: pad + cell * x - size * 0.08, top: pad + cell * y - size * 0.08,
        }} />
      ))}
    </div>
  );
}

// Setup
function LeikSetup() {
  const [game, setGame] = React.useState('leika');
  const [cats, setCats] = React.useState({ nafn: true, sagn: false, lys: true, orne: true });
  const sel = Object.values(cats).filter(Boolean).length;
  return (
    <div style={{ background: LeikTokens.bg, minHeight: '100%', fontFamily: LeikTokens.font, color: LeikTokens.ink, padding: '12px 22px 28px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: LeikTokens.mono, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase' }}>Orð · 01</div>
        <DieFace n={3} size={28} bg={LeikTokens.yellow} />
      </div>

      <h1 style={{ fontSize: 46, lineHeight: 0.92, margin: '18px 0 14px', fontWeight: 900, letterSpacing: -2 }}>
        Veldu<br/>
        <span style={{ display: 'inline-block', background: LeikTokens.yellow, padding: '0 8px', border: `2.5px solid ${LeikTokens.ink}`, borderRadius: 8, transform: 'rotate(-1.5deg)' }}>leik!</span>
      </h1>

      {/* game type 2x2 with playful tilts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 26 }}>
        {GAME_TYPES.map((g, i) => {
          const tones = [LeikTokens.red, LeikTokens.yellow, LeikTokens.blue, LeikTokens.green];
          const fgs = [LeikTokens.white, LeikTokens.ink, LeikTokens.white, LeikTokens.white];
          const tilts = [-1.5, 1.5, -1, 1];
          const isSel = game === g.id;
          return (
            <PopTile key={g.id} onClick={() => setGame(g.id)}
              color={isSel ? tones[i] : LeikTokens.white}
              fg={isSel ? fgs[i] : LeikTokens.ink}
              tilt={tilts[i]}
              depth={isSel ? 7 : 4}
              style={{ padding: '12px 12px 14px', minHeight: 110, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: 36, lineHeight: 1 }}>{g.emoji}</div>
                <DieFace n={i+1} size={22} bg={isSel ? LeikTokens.white : LeikTokens.bgPanel} />
              </div>
              <div>
                <div style={{ fontSize: 19, fontWeight: 900, letterSpacing: -0.5, lineHeight: 1 }}>{g.label}</div>
                <div style={{ fontFamily: LeikTokens.mono, fontSize: 10, opacity: 0.8, marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{g.en}</div>
              </div>
            </PopTile>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.5 }}>Orðaflokkar</div>
        <div style={{ fontFamily: LeikTokens.mono, fontSize: 11, background: LeikTokens.ink, color: LeikTokens.bg, padding: '3px 8px', borderRadius: 6, letterSpacing: 1 }}>{sel}/4</div>
      </div>

      <div style={{ display: 'grid', gap: 10, marginBottom: 28 }}>
        {CATEGORIES.map((c, i) => {
          const on = cats[c.id];
          const colors = [LeikTokens.pink, LeikTokens.green, LeikTokens.purple, LeikTokens.blue];
          return (
            <PopTile key={c.id} onClick={() => setCats({ ...cats, [c.id]: !on })}
              color={on ? colors[i] : LeikTokens.white}
              fg={on ? LeikTokens.white : LeikTokens.ink}
              depth={on ? 5 : 3} radius={14}
              style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 6,
                  border: `2.5px solid ${on ? LeikTokens.white : LeikTokens.ink}`,
                  background: on ? LeikTokens.white : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 900, color: colors[i],
                }}>{on ? '×' : ''}</div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.3 }}>{c.label}</div>
                  <div style={{ fontFamily: LeikTokens.mono, fontSize: 10, opacity: 0.85, textTransform: 'uppercase', letterSpacing: 1 }}>{c.en} · {c.count}</div>
                </div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 900 }}>{on ? '✓' : '+'}</div>
            </PopTile>
          );
        })}
      </div>

      <PopTile color={LeikTokens.green} fg={LeikTokens.white} depth={7}
        style={{ padding: '18px 0', textAlign: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>BYRJA LEIK ▶</div>
      </PopTile>
    </div>
  );
}

// Play
function LeikPlay() {
  return (
    <div style={{ background: LeikTokens.bg, minHeight: '100%', fontFamily: LeikTokens.font, color: LeikTokens.ink, padding: '12px 22px 28px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <DieFace n={3} size={26} bg={LeikTokens.yellow} />
          <div>
            <div style={{ fontFamily: LeikTokens.mono, fontSize: 9, letterSpacing: 1.2, textTransform: 'uppercase', color: LeikTokens.inkSoft }}>Leika</div>
            <div style={{ fontSize: 13, fontWeight: 800 }}>Runda 3</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontFamily: LeikTokens.mono, fontSize: 10, fontWeight: 800, background: LeikTokens.ink, color: LeikTokens.bg, padding: '4px 8px', borderRadius: 6 }}>0:42</span>
          <span style={{ fontFamily: LeikTokens.mono, fontSize: 10, fontWeight: 800, background: LeikTokens.green, color: LeikTokens.white, padding: '4px 8px', borderRadius: 6, border: `2px solid ${LeikTokens.ink}` }}>+30</span>
        </div>
      </div>

      {/* Word card with sticker style */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 0', position: 'relative' }}>
        {/* decorative meeples */}
        <div style={{ position: 'absolute', top: 10, left: 6, transform: 'rotate(-15deg)' }}>
          <DieFace n={5} size={28} bg={LeikTokens.pink} />
        </div>
        <div style={{ position: 'absolute', bottom: 16, right: 10, transform: 'rotate(20deg)' }}>
          <DieFace n={2} size={28} bg={LeikTokens.blue} fg={LeikTokens.white} />
        </div>

        <PopTile color={LeikTokens.white} depth={9} radius={22}
          style={{ width: '100%', padding: '32px 16px 28px', textAlign: 'center', transform: 'rotate(-1.5deg)' }}>
          <div style={{
            display: 'inline-block', fontFamily: LeikTokens.mono, fontSize: 10, fontWeight: 800,
            background: LeikTokens.yellow, padding: '4px 10px',
            border: `2px solid ${LeikTokens.ink}`, borderRadius: 999,
            letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 16,
          }}>★ orð ★</div>
          <div style={{ fontSize: 42, fontWeight: 900, lineHeight: 1, letterSpacing: -2 }}>
            ráðherra
          </div>
          <div style={{ marginTop: 12, fontFamily: LeikTokens.mono, fontSize: 12, color: LeikTokens.inkSoft, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
            nafnorð
          </div>
        </PopTile>
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        <PopTile color={LeikTokens.blue} fg={LeikTokens.white} depth={6}
          style={{ padding: '16px 0', textAlign: 'center', fontSize: 19, fontWeight: 900, letterSpacing: -0.5 }}>
          ⟶ SKOÐA SVAR
        </PopTile>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <PopTile color={LeikTokens.yellow} fg={LeikTokens.ink} depth={4}
            style={{ padding: '14px 0', textAlign: 'center', fontSize: 15, fontWeight: 900 }}>
            ↷ SLEPPA
          </PopTile>
          <PopTile color={LeikTokens.red} fg={LeikTokens.white} depth={4}
            style={{ padding: '14px 0', textAlign: 'center', fontSize: 15, fontWeight: 900 }}>
            ✕ HÆTTA
          </PopTile>
        </div>
      </div>
    </div>
  );
}

// Review
function LeikReview() {
  const [rating, setRating] = React.useState('easy');
  const ratings = [
    { id: 'easy',   label: 'Létt',  en: 'Easy',   color: LeikTokens.green,  pips: 1 },
    { id: 'medium', label: 'Mið',   en: 'Mid',    color: LeikTokens.yellow, fg: LeikTokens.ink, pips: 2 },
    { id: 'hard',   label: 'Þungt', en: 'Hard',   color: LeikTokens.red,    pips: 3 },
  ];
  return (
    <div style={{ background: LeikTokens.bg, minHeight: '100%', fontFamily: LeikTokens.font, color: LeikTokens.ink, padding: '12px 22px 28px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: LeikTokens.mono, fontSize: 11, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase' }}>← Aftur</div>
        <div style={{ fontFamily: LeikTokens.mono, fontSize: 11, fontWeight: 800, background: LeikTokens.ink, color: LeikTokens.bg, padding: '3px 8px', borderRadius: 6 }}>03/07</div>
      </div>

      {/* Word card */}
      <div style={{ marginTop: 18 }}>
        <PopTile color={LeikTokens.bgPanel} depth={6} radius={20} tilt={1}
          style={{ padding: '20px 16px', textAlign: 'center' }}>
          <div style={{ fontFamily: LeikTokens.mono, fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: LeikTokens.inkSoft }}>Orðið var</div>
          <div style={{ fontSize: 38, fontWeight: 900, lineHeight: 1, letterSpacing: -1.5, marginTop: 4 }}>ráðherra</div>
          <div style={{ marginTop: 6, fontFamily: LeikTokens.mono, fontSize: 11, color: LeikTokens.inkSoft, fontWeight: 700 }}>nafnorð · 'minister'</div>
        </PopTile>
      </div>

      <div style={{ marginTop: 24, marginBottom: 12 }}>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.7 }}>Hvernig var orðið?</div>
        <div style={{ fontFamily: LeikTokens.mono, fontSize: 11, color: LeikTokens.inkSoft, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>Tap to rate</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 'auto' }}>
        {ratings.map((r) => {
          const isSel = rating === r.id;
          return (
            <PopTile key={r.id} onClick={() => setRating(r.id)}
              color={isSel ? r.color : LeikTokens.white}
              fg={isSel ? (r.fg || LeikTokens.white) : LeikTokens.ink}
              depth={isSel ? 6 : 3}
              style={{ padding: '14px 6px 12px', textAlign: 'center', minHeight: 110, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <DieFace n={r.pips} size={32}
                  bg={isSel ? LeikTokens.white : r.color}
                  fg={isSel ? r.color : (r.fg || LeikTokens.white)} />
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.4 }}>{r.label}</div>
              <div style={{ fontFamily: LeikTokens.mono, fontSize: 9, opacity: 0.85, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>{r.en}</div>
            </PopTile>
          );
        })}
      </div>

      <div style={{ marginTop: 20 }}>
        <PopTile color={LeikTokens.blue} fg={LeikTokens.white} depth={6}
          style={{ padding: '16px 0', textAlign: 'center', fontSize: 19, fontWeight: 900, letterSpacing: -0.4 }}>
          NÆSTA ORÐ ▶
        </PopTile>
      </div>
    </div>
  );
}

// Summary
function LeikSummary() {
  const played = [
    { word: 'eldfjall',      cat: 'nafnorð', rating: 'easy' },
    { word: 'dansa',         cat: 'sagnorð', rating: 'medium' },
    { word: 'elding',        cat: 'nafnorð', rating: 'easy' },
    { word: 'alþingi',       cat: 'örnefni', rating: 'hard' },
    { word: 'ráðherra',      cat: 'nafnorð', rating: 'skipped' },
    { word: 'Þingvallavatn', cat: 'örnefni', rating: 'hard' },
  ];
  const map = {
    easy:    { color: LeikTokens.green,  fg: LeikTokens.white, label: 'Létt',   pips: 1 },
    medium:  { color: LeikTokens.yellow, fg: LeikTokens.ink,   label: 'Mið',    pips: 2 },
    hard:    { color: LeikTokens.red,    fg: LeikTokens.white, label: 'Þungt',  pips: 3 },
    skipped: { color: LeikTokens.white,  fg: LeikTokens.ink,   label: 'Sleppt', pips: 0 },
  };
  return (
    <div style={{ background: LeikTokens.bg, minHeight: '100%', fontFamily: LeikTokens.font, color: LeikTokens.ink, padding: '12px 22px 28px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: LeikTokens.mono, fontSize: 11, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase' }}>Lokum</div>
        <div style={{ display: 'flex', gap: 4 }}>
          <DieFace n={5} size={22} bg={LeikTokens.pink} />
          <DieFace n={6} size={22} bg={LeikTokens.green} fg={LeikTokens.white} />
        </div>
      </div>

      {/* Hero */}
      <div style={{ marginTop: 14, marginBottom: 18 }}>
        <PopTile color={LeikTokens.yellow} depth={7} radius={22} tilt={-1}
          style={{ padding: '20px 18px 22px', position: 'relative' }}>
          <div style={{ fontFamily: LeikTokens.mono, fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase' }}>Frábært!</div>
          <div style={{ fontSize: 44, fontWeight: 900, lineHeight: 0.95, letterSpacing: -2, marginTop: 4 }}>+180 stig</div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            {[
              { n: '6', l: 'Orð' },
              { n: '4', l: 'Skoruð' },
              { n: '2', l: 'Þung' },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, background: LeikTokens.white, border: `2.5px solid ${LeikTokens.ink}`, borderRadius: 12, padding: '8px 4px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontFamily: LeikTokens.mono, fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </PopTile>
      </div>

      <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: -0.4, marginBottom: 10 }}>Orðin þín</div>
      <div style={{ display: 'grid', gap: 8, marginBottom: 22 }}>
        {played.map((p, i) => {
          const m = map[p.rating];
          return (
            <PopTile key={i} color={LeikTokens.white} depth={3} radius={12}
              style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <DieFace n={Math.max(1, m.pips)} size={26} bg={m.color} fg={m.fg} />
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: -0.3 }}>{p.word}</div>
                  <div style={{ fontFamily: LeikTokens.mono, fontSize: 9, color: LeikTokens.inkSoft, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>{p.cat}</div>
                </div>
              </div>
              <div style={{
                fontFamily: LeikTokens.mono, fontSize: 10, fontWeight: 800,
                background: m.color, color: m.fg, padding: '4px 10px',
                border: `2px solid ${LeikTokens.ink}`, borderRadius: 999,
                letterSpacing: 1, textTransform: 'uppercase',
              }}>{m.label}</div>
            </PopTile>
          );
        })}
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        <PopTile color={LeikTokens.green} fg={LeikTokens.white} depth={6}
          style={{ padding: '16px 0', textAlign: 'center', fontSize: 19, fontWeight: 900, letterSpacing: -0.4 }}>
          ▶ AFTUR
        </PopTile>
        <PopTile color={LeikTokens.white} fg={LeikTokens.ink} depth={3}
          style={{ padding: '14px 0', textAlign: 'center', fontSize: 15, fontWeight: 900 }}>
          ⌂ AÐALVALMYND
        </PopTile>
      </div>
    </div>
  );
}

Object.assign(window, { LeikTokens, PopTile, DieFace, LeikSetup, LeikPlay, LeikReview, LeikSummary });
