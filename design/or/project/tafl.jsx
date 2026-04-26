// Direction 1 — "Tafl"
// Warm cardboard board game. Cream paper, terracotta, mustard, forest, ink.
// Big chunky tiles with hard drop shadows. Display type: Fraunces-alternative
// "Familjen Grotesk" + "DM Mono" for accents.

const TaflTokens = {
  bg: '#f3e7cf',         // tabletop cream
  bgDeep: '#e9d9b6',
  ink: '#2a1f15',
  inkSoft: '#5a4736',
  card: '#fbf3df',
  cardEdge: '#d9c391',
  terracotta: '#c9532b',
  terracottaDark: '#8e3818',
  mustard: '#d99a2b',
  forest: '#2f6b3f',
  forestDark: '#1c4a2a',
  red: '#a22b1c',
  blue: '#2a4d8f',
  font: '"Familjen Grotesk", "Inter", system-ui, sans-serif',
  display: '"Familjen Grotesk", "Inter", system-ui, sans-serif',
  mono: '"DM Mono", ui-monospace, monospace',
};

// Board-game style tile with a hard-stamped offset shadow.
function TaflTile({ children, color, fg = TaflTokens.ink, depth = 4, depthColor, radius = 14, style = {}, onClick, selected = false, pressed = false }) {
  const shadow = depthColor || 'rgba(60,35,15,0.55)';
  return (
    <div onClick={onClick} style={{
      background: color,
      color: fg,
      borderRadius: radius,
      boxShadow: pressed
        ? `0 0 0 2px ${TaflTokens.ink} inset, 0 1px 0 ${shadow}`
        : `0 0 0 2px ${TaflTokens.ink} inset, ${depth}px ${depth}px 0 ${TaflTokens.ink}`,
      outline: selected ? `3px solid ${TaflTokens.ink}` : 'none',
      outlineOffset: selected ? 4 : 0,
      cursor: onClick ? 'pointer' : 'default',
      transform: pressed ? `translate(${depth/2}px, ${depth/2}px)` : 'none',
      transition: 'transform 80ms ease',
      ...style,
    }}>
      {children}
    </div>
  );
}

// Setup — game type picker + categories + Byrja.
function TaflSetup() {
  const [game, setGame] = React.useState('utskyra');
  const [cats, setCats] = React.useState({ nafn: true, sagn: true, lys: false, orne: false });
  const selectedCount = Object.values(cats).filter(Boolean).length;

  return (
    <div style={{ background: TaflTokens.bg, minHeight: '100%', fontFamily: TaflTokens.font, color: TaflTokens.ink, padding: '12px 22px 28px', boxSizing: 'border-box' }}>
      {/* eyebrow */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }}>
        <div style={{ fontFamily: TaflTokens.mono, fontSize: 11, letterSpacing: 1.4, color: TaflTokens.inkSoft, textTransform: 'uppercase' }}>Orð · 01 / Uppsetning</div>
        <Pip color={TaflTokens.terracotta} />
      </div>

      {/* title */}
      <h1 style={{ fontSize: 38, lineHeight: 1, margin: '18px 0 6px', fontWeight: 700, letterSpacing: -1 }}>
        Veldu<br/>leik.
      </h1>
      <p style={{ fontFamily: TaflTokens.mono, fontSize: 12, color: TaflTokens.inkSoft, margin: '0 0 18px' }}>
        4 leikgerðir · 1 borð
      </p>

      {/* game type 2x2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        {GAME_TYPES.map((g, i) => {
          const colors = [TaflTokens.terracotta, TaflTokens.mustard, TaflTokens.forest, TaflTokens.blue];
          const fgs = ['#fdf3df', TaflTokens.ink, '#fdf3df', '#fdf3df'];
          const isSel = game === g.id;
          return (
            <TaflTile key={g.id}
              onClick={() => setGame(g.id)}
              color={isSel ? colors[i] : TaflTokens.card}
              fg={isSel ? fgs[i] : TaflTokens.ink}
              depth={isSel ? 5 : 3}
              style={{ padding: '14px 14px 12px', minHeight: 96, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 30, lineHeight: 1 }}>{g.emoji}</div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.3 }}>{g.label}</div>
                <div style={{ fontFamily: TaflTokens.mono, fontSize: 10, opacity: 0.75, marginTop: 2 }}>{g.en}</div>
              </div>
            </TaflTile>
          );
        })}
      </div>

      {/* categories */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>Orðaflokkar</div>
        <div style={{ fontFamily: TaflTokens.mono, fontSize: 11, color: TaflTokens.inkSoft }}>{selectedCount}/4 valdir</div>
      </div>
      <div style={{ display: 'grid', gap: 8, marginBottom: 24 }}>
        {CATEGORIES.map((c) => {
          const on = cats[c.id];
          return (
            <TaflTile key={c.id}
              onClick={() => setCats({ ...cats, [c.id]: !on })}
              color={on ? TaflTokens.forest : TaflTokens.card}
              fg={on ? '#fdf3df' : TaflTokens.ink}
              depth={3} radius={12}
              style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6,
                  border: `2px solid ${on ? '#fdf3df' : TaflTokens.ink}`,
                  background: on ? '#fdf3df' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, color: TaflTokens.forest, fontWeight: 900,
                }}>{on ? '✓' : ''}</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{c.label}</div>
                  <div style={{ fontFamily: TaflTokens.mono, fontSize: 10, opacity: 0.7 }}>{c.en}</div>
                </div>
              </div>
              <div style={{ fontFamily: TaflTokens.mono, fontSize: 12, opacity: 0.85 }}>{c.count}</div>
            </TaflTile>
          );
        })}
      </div>

      {/* CTA */}
      <TaflTile
        color={selectedCount ? TaflTokens.terracotta : TaflTokens.bgDeep}
        fg={selectedCount ? '#fdf3df' : TaflTokens.inkSoft}
        depth={selectedCount ? 6 : 2}
        radius={16}
        style={{ padding: '18px 0', textAlign: 'center', fontSize: 20, fontWeight: 800, letterSpacing: 0.5 }}>
        BYRJA →
      </TaflTile>
    </div>
  );
}

// Play screen
function TaflPlay() {
  return (
    <div style={{ background: TaflTokens.bg, minHeight: '100%', fontFamily: TaflTokens.font, color: TaflTokens.ink, padding: '12px 22px 28px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
        <div style={{ fontFamily: TaflTokens.mono, fontSize: 11, letterSpacing: 1.4, color: TaflTokens.inkSoft, textTransform: 'uppercase' }}>Útskýra · runda 03</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[1,2,3].map(i => <Pip key={i} color={i<=3 ? TaflTokens.terracotta : TaflTokens.cardEdge} />)}
          {[4,5,6,7].map(i => <Pip key={i} color={TaflTokens.cardEdge} />)}
        </div>
      </div>

      {/* Big word tile */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 0' }}>
        <TaflTile color={TaflTokens.card} depth={8} radius={20}
          style={{ width: '100%', padding: '36px 18px 30px', textAlign: 'center', transform: 'rotate(-1.2deg)' }}>
          <div style={{ fontFamily: TaflTokens.mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: TaflTokens.inkSoft, marginBottom: 14 }}>
            ◆ orð ◆
          </div>
          <div style={{ fontSize: 46, fontWeight: 700, lineHeight: 1, letterSpacing: -1.5 }}>
            eldfjall
          </div>
          <div style={{ marginTop: 14, display: 'inline-flex', gap: 6, alignItems: 'center', padding: '4px 10px', border: `1.5px solid ${TaflTokens.ink}`, borderRadius: 999, fontFamily: TaflTokens.mono, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
            <Pip color={TaflTokens.terracotta} size={5} /> nafnorð
          </div>
          <div style={{ marginTop: 20, fontFamily: TaflTokens.mono, fontSize: 11, color: TaflTokens.inkSoft, letterSpacing: 1.5 }}>
            01 : 24
          </div>
        </TaflTile>
      </div>

      {/* Actions */}
      <div style={{ display: 'grid', gap: 10 }}>
        <TaflTile color={TaflTokens.blue} fg="#fdf3df" depth={5}
          style={{ padding: '16px 0', textAlign: 'center', fontSize: 17, fontWeight: 800, letterSpacing: 0.5 }}>
          ÉG VEIT ÞAÐ →
        </TaflTile>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <TaflTile color={TaflTokens.mustard} fg={TaflTokens.ink} depth={4}
            style={{ padding: '14px 0', textAlign: 'center', fontSize: 14, fontWeight: 700 }}>
            ↷ Sleppa
          </TaflTile>
          <TaflTile color={TaflTokens.card} fg={TaflTokens.red} depth={4}
            style={{ padding: '14px 0', textAlign: 'center', fontSize: 14, fontWeight: 700 }}>
            ✕ Hætta
          </TaflTile>
        </div>
      </div>
    </div>
  );
}

// Review screen
function TaflReview() {
  const [rating, setRating] = React.useState('medium');
  const ratings = [
    { id: 'easy',   label: 'Létt',  en: 'Easy',   color: TaflTokens.forest, fg: '#fdf3df' },
    { id: 'medium', label: 'Mið',   en: 'Medium', color: TaflTokens.mustard, fg: TaflTokens.ink },
    { id: 'hard',   label: 'Þungt', en: 'Hard',   color: TaflTokens.terracotta, fg: '#fdf3df' },
  ];
  return (
    <div style={{ background: TaflTokens.bg, minHeight: '100%', fontFamily: TaflTokens.font, color: TaflTokens.ink, padding: '12px 22px 28px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
        <div style={{ fontFamily: TaflTokens.mono, fontSize: 11, letterSpacing: 1.4, color: TaflTokens.inkSoft, textTransform: 'uppercase' }}>← Til baka</div>
        <div style={{ fontFamily: TaflTokens.mono, fontSize: 11, letterSpacing: 1.4, color: TaflTokens.inkSoft, textTransform: 'uppercase' }}>03 / 07</div>
      </div>

      {/* Word */}
      <div style={{ marginTop: 18 }}>
        <TaflTile color={TaflTokens.card} depth={6} radius={18}
          style={{ padding: '20px 16px 18px', textAlign: 'center', transform: 'rotate(0.6deg)' }}>
          <div style={{ fontFamily: TaflTokens.mono, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: TaflTokens.inkSoft, marginBottom: 8 }}>orðið var</div>
          <div style={{ fontSize: 38, fontWeight: 700, lineHeight: 1, letterSpacing: -1 }}>eldfjall</div>
          <div style={{ marginTop: 6, fontFamily: TaflTokens.mono, fontSize: 11, color: TaflTokens.inkSoft }}>(nafnorð · volcano)</div>
        </TaflTile>
      </div>

      {/* Question */}
      <div style={{ marginTop: 22, marginBottom: 10 }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Hversu þungt var orðið?</div>
        <div style={{ fontFamily: TaflTokens.mono, fontSize: 11, color: TaflTokens.inkSoft }}>How hard was this word?</div>
      </div>

      {/* Difficulty pegs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 'auto' }}>
        {ratings.map((r) => {
          const sel = rating === r.id;
          return (
            <TaflTile key={r.id} onClick={() => setRating(r.id)}
              color={sel ? r.color : TaflTokens.card}
              fg={sel ? r.fg : TaflTokens.ink}
              depth={sel ? 5 : 3} radius={12}
              style={{ padding: '16px 6px', textAlign: 'center', minHeight: 96, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
                {[1,2,3].map(i => (
                  <span key={i} style={{
                    width: 8, height: 8, borderRadius: 999,
                    background: i <= (r.id === 'easy' ? 1 : r.id === 'medium' ? 2 : 3)
                      ? (sel ? r.fg : TaflTokens.ink)
                      : 'transparent',
                    border: `1.5px solid ${sel ? r.fg : TaflTokens.ink}`,
                  }} />
                ))}
              </div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>{r.label}</div>
              <div style={{ fontFamily: TaflTokens.mono, fontSize: 9, opacity: 0.75 }}>{r.en}</div>
            </TaflTile>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
        <TaflTile color={TaflTokens.blue} fg="#fdf3df" depth={5}
          style={{ padding: '16px 0', textAlign: 'center', fontSize: 17, fontWeight: 800, letterSpacing: 0.5 }}>
          NÆSTA ORÐ →
        </TaflTile>
      </div>
    </div>
  );
}

// Summary screen
function TaflSummary() {
  const played = [
    { word: 'eldfjall',      cat: 'nafnorð',  rating: 'easy',    icon: '◆' },
    { word: 'dansa',         cat: 'sagnorð',  rating: 'medium',  icon: '◆◆' },
    { word: 'elding',        cat: 'nafnorð',  rating: 'easy',    icon: '◆' },
    { word: 'alþingi',       cat: 'örnefni',  rating: 'hard',    icon: '◆◆◆' },
    { word: 'ráðherra',      cat: 'nafnorð',  rating: 'skipped', icon: '↷' },
    { word: 'Þingvallavatn', cat: 'örnefni',  rating: 'hard',    icon: '◆◆◆' },
  ];
  const ratingColor = { easy: TaflTokens.forest, medium: TaflTokens.mustard, hard: TaflTokens.terracotta, skipped: TaflTokens.inkSoft };
  const ratingLabel = { easy: 'létt', medium: 'mið', hard: 'þungt', skipped: 'sleppt' };
  return (
    <div style={{ background: TaflTokens.bg, minHeight: '100%', fontFamily: TaflTokens.font, color: TaflTokens.ink, padding: '12px 22px 28px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
        <div style={{ fontFamily: TaflTokens.mono, fontSize: 11, letterSpacing: 1.4, color: TaflTokens.inkSoft, textTransform: 'uppercase' }}>Lokum</div>
        <div style={{ fontFamily: TaflTokens.mono, fontSize: 11, letterSpacing: 1.4, color: TaflTokens.inkSoft, textTransform: 'uppercase' }}>04 : 12</div>
      </div>

      {/* Hero */}
      <div style={{ marginTop: 16, marginBottom: 18 }}>
        <TaflTile color={TaflTokens.terracotta} fg="#fdf3df" depth={6} radius={20}
          style={{ padding: '22px 20px 20px', position: 'relative' }}>
          <div style={{ fontFamily: TaflTokens.mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.85 }}>Leikur lokið</div>
          <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1, letterSpacing: -1, marginTop: 6 }}>Vel gert!</div>
          <div style={{ display: 'flex', gap: 18, marginTop: 18 }}>
            <div>
              <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1 }}>6</div>
              <div style={{ fontFamily: TaflTokens.mono, fontSize: 10, opacity: 0.85, marginTop: 2 }}>orð</div>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.4)' }} />
            <div>
              <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1 }}>5</div>
              <div style={{ fontFamily: TaflTokens.mono, fontSize: 10, opacity: 0.85, marginTop: 2 }}>einkunnir</div>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.4)' }} />
            <div>
              <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1 }}>83%</div>
              <div style={{ fontFamily: TaflTokens.mono, fontSize: 10, opacity: 0.85, marginTop: 2 }}>árangur</div>
            </div>
          </div>
        </TaflTile>
      </div>

      <div style={{ fontFamily: TaflTokens.mono, fontSize: 11, color: TaflTokens.inkSoft, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Orðin</div>

      <div style={{ display: 'grid', gap: 6, marginBottom: 18 }}>
        {played.map((p, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: TaflTokens.card, border: `1.5px solid ${TaflTokens.ink}`, borderRadius: 10,
            padding: '10px 12px',
            boxShadow: `2px 2px 0 ${TaflTokens.ink}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontFamily: TaflTokens.mono, fontSize: 10, color: TaflTokens.inkSoft, width: 18 }}>{String(i+1).padStart(2, '0')}</span>
              <span style={{ fontSize: 16, fontWeight: 700 }}>{p.word}</span>
              <span style={{ fontFamily: TaflTokens.mono, fontSize: 10, color: TaflTokens.inkSoft }}>· {p.cat}</span>
            </div>
            <div style={{
              fontFamily: TaflTokens.mono, fontSize: 10, color: '#fdf3df', textTransform: 'uppercase', letterSpacing: 1,
              background: ratingColor[p.rating], padding: '3px 8px', borderRadius: 999,
            }}>
              {ratingLabel[p.rating]}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 10, marginTop: 'auto' }}>
        <TaflTile color={TaflTokens.forest} fg="#fdf3df" depth={5}
          style={{ padding: '16px 0', textAlign: 'center', fontSize: 17, fontWeight: 800, letterSpacing: 0.5 }}>
          ↻ AFTUR
        </TaflTile>
        <TaflTile color={TaflTokens.card} fg={TaflTokens.ink} depth={3}
          style={{ padding: '14px 0', textAlign: 'center', fontSize: 15, fontWeight: 700 }}>
          ⌂ Aðalvalmynd
        </TaflTile>
      </div>
    </div>
  );
}

Object.assign(window, { TaflTokens, TaflTile, TaflSetup, TaflPlay, TaflReview, TaflSummary });
