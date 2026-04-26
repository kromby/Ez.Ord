// Direction 2 — "Saga"
// Nordic vintage. Parchment cream + deep teal + ochre + charcoal.
// Subtle runic motifs. Type pairing: serif display + grotesk + mono.

const SagaTokens = {
  bg: '#ece1c7',          // parchment
  bgDeep: '#dccfaf',
  ink: '#1c2a2c',         // dark slate
  inkSoft: '#4d5a5a',
  card: '#f6ecd2',
  teal: '#114a4a',
  tealMid: '#1f6b66',
  ochre: '#c08a1a',
  ochreLight: '#e3b34a',
  rust: '#a4421f',
  forest: '#3a5d33',
  font: '"Familjen Grotesk", "Inter", system-ui, sans-serif',
  serif: '"DM Serif Display", "EB Garamond", Georgia, serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
};

// Decorative rune-style strip — pure squares/triangles, no copyright concerns.
function RuneStrip({ color = SagaTokens.ink, opacity = 0.75 }) {
  const glyphs = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ','ᛁ','ᛃ'];
  return (
    <div style={{ fontSize: 10, letterSpacing: 6, color, opacity, fontFamily: 'serif' }}>
      {glyphs.join('')}
    </div>
  );
}

// Rounded "stone" tile with a thin ink stroke and inner shadow line.
function StoneTile({ children, color = SagaTokens.card, fg = SagaTokens.ink, selected = false, onClick, style = {}, radius = 14, border = SagaTokens.ink }) {
  return (
    <div onClick={onClick} style={{
      background: color,
      color: fg,
      borderRadius: radius,
      border: `1.5px solid ${border}`,
      boxShadow: selected
        ? `inset 0 0 0 3px ${color}, inset 0 0 0 4.5px ${border}, 0 4px 0 ${border}`
        : `0 2px 0 ${border}`,
      cursor: onClick ? 'pointer' : 'default',
      position: 'relative',
      ...style,
    }}>
      {children}
    </div>
  );
}

// Setup
function SagaSetup() {
  const [game, setGame] = React.useState('teikna');
  const [cats, setCats] = React.useState({ nafn: true, sagn: true, lys: true, orne: false });
  const sel = Object.values(cats).filter(Boolean).length;
  return (
    <div style={{ background: SagaTokens.bg, minHeight: '100%', fontFamily: SagaTokens.font, color: SagaTokens.ink, padding: '12px 22px 28px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
        <div style={{ fontFamily: SagaTokens.mono, fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase', color: SagaTokens.inkSoft }}>Orð · Kafli I</div>
        <RuneStrip color={SagaTokens.teal} />
      </div>

      <h1 style={{ fontFamily: SagaTokens.serif, fontSize: 44, lineHeight: 0.95, margin: '20px 0 4px', fontWeight: 400, letterSpacing: -0.5 }}>
        Veldu þinn<br/><span style={{ fontStyle: 'italic', color: SagaTokens.teal }}>leik.</span>
      </h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
        <div style={{ height: 1, flex: 1, background: SagaTokens.ink, opacity: 0.3 }} />
        <div style={{ fontFamily: SagaTokens.mono, fontSize: 10, color: SagaTokens.inkSoft, letterSpacing: 1.5, textTransform: 'uppercase' }}>fjórar leiðir</div>
        <div style={{ height: 1, flex: 1, background: SagaTokens.ink, opacity: 0.3 }} />
      </div>

      {/* game types as a tall list with diamond emoji */}
      <div style={{ display: 'grid', gap: 10, marginBottom: 26 }}>
        {GAME_TYPES.map((g, i) => {
          const isSel = game === g.id;
          return (
            <StoneTile key={g.id} onClick={() => setGame(g.id)}
              color={isSel ? SagaTokens.teal : SagaTokens.card}
              fg={isSel ? SagaTokens.bg : SagaTokens.ink}
              border={isSel ? SagaTokens.ink : SagaTokens.ink}
              style={{ padding: '14px 14px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: isSel ? SagaTokens.ochreLight : SagaTokens.bgDeep,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                border: `1.5px solid ${SagaTokens.ink}`,
              }}>{g.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: SagaTokens.serif, fontSize: 22, lineHeight: 1, fontStyle: isSel ? 'italic' : 'normal' }}>{g.label}</div>
                <div style={{ fontFamily: SagaTokens.mono, fontSize: 10, opacity: 0.7, marginTop: 4, letterSpacing: 1, textTransform: 'uppercase' }}>{g.en}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{isSel ? '◆' : '◇'}</div>
            </StoneTile>
          );
        })}
      </div>

      <div style={{ fontFamily: SagaTokens.mono, fontSize: 10, color: SagaTokens.inkSoft, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>· Orðaflokkar · {sel}/4</div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
        {CATEGORIES.map((c) => {
          const on = cats[c.id];
          return (
            <StoneTile key={c.id} onClick={() => setCats({ ...cats, [c.id]: !on })}
              color={on ? SagaTokens.ochreLight : SagaTokens.card}
              fg={SagaTokens.ink} radius={999}
              style={{ padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12 }}>{on ? '✦' : '◌'}</span>
              <span style={{ fontFamily: SagaTokens.serif, fontStyle: on ? 'italic' : 'normal', fontSize: 16 }}>{c.label}</span>
              <span style={{ fontFamily: SagaTokens.mono, fontSize: 10, opacity: 0.6 }}>{c.count}</span>
            </StoneTile>
          );
        })}
      </div>

      <StoneTile color={SagaTokens.teal} fg={SagaTokens.bg} radius={14}
        style={{ padding: '16px 0', textAlign: 'center' }}>
        <div style={{ fontFamily: SagaTokens.serif, fontStyle: 'italic', fontSize: 22 }}>Hefjum leik →</div>
        <div style={{ fontFamily: SagaTokens.mono, fontSize: 9, opacity: 0.7, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 2 }}>Begin the saga</div>
      </StoneTile>
    </div>
  );
}

// Play
function SagaPlay() {
  return (
    <div style={{ background: SagaTokens.bg, minHeight: '100%', fontFamily: SagaTokens.font, color: SagaTokens.ink, padding: '12px 22px 28px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: SagaTokens.mono, fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', color: SagaTokens.inkSoft }}>Útskýra</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: SagaTokens.mono, fontSize: 10 }}>03/07</span>
          <div style={{ display: 'flex', gap: 3 }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: 999, border: `1.5px solid ${SagaTokens.ink}`, background: i < 3 ? SagaTokens.teal : 'transparent' }} />
            ))}
          </div>
        </div>
      </div>

      {/* Big word card */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '20px 0' }}>
        <StoneTile color={SagaTokens.card} radius={20}
          style={{ padding: '28px 18px 24px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <RuneStrip color={SagaTokens.teal} opacity={0.85} />
          </div>
          <div style={{ fontFamily: SagaTokens.serif, fontSize: 52, lineHeight: 1, letterSpacing: -1.5 }}>
            elding
          </div>
          <div style={{ marginTop: 10, fontFamily: SagaTokens.mono, fontSize: 11, color: SagaTokens.inkSoft, letterSpacing: 1.2, textTransform: 'uppercase' }}>
            nafnorð · kvk
          </div>
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 10, fontFamily: SagaTokens.mono, fontSize: 10, color: SagaTokens.inkSoft }}>
            <span>0:42 eftir</span>
            <span>·</span>
            <span>+10 stig</span>
          </div>
        </StoneTile>
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        <StoneTile color={SagaTokens.teal} fg={SagaTokens.bg} radius={14}
          style={{ padding: '15px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: SagaTokens.serif, fontStyle: 'italic', fontSize: 20 }}>Skoða svar</span>
          <span style={{ fontSize: 16 }}>◆</span>
        </StoneTile>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <StoneTile color={SagaTokens.ochreLight} radius={12}
            style={{ padding: '13px 0', textAlign: 'center', fontFamily: SagaTokens.serif, fontSize: 17 }}>
            Sleppa
          </StoneTile>
          <StoneTile color={SagaTokens.card} fg={SagaTokens.rust} radius={12}
            style={{ padding: '13px 0', textAlign: 'center', fontFamily: SagaTokens.serif, fontSize: 17 }}>
            Hætta
          </StoneTile>
        </div>
      </div>
    </div>
  );
}

// Review
function SagaReview() {
  const [rating, setRating] = React.useState('hard');
  const ratings = [
    { id: 'easy',   label: 'Létt',  en: 'Easy',   color: SagaTokens.forest, glyph: '·' },
    { id: 'medium', label: 'Mið',   en: 'Mid',    color: SagaTokens.ochre,  glyph: '··' },
    { id: 'hard',   label: 'Þungt', en: 'Hard',   color: SagaTokens.rust,   glyph: '···' },
  ];
  return (
    <div style={{ background: SagaTokens.bg, minHeight: '100%', fontFamily: SagaTokens.font, color: SagaTokens.ink, padding: '12px 22px 28px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: SagaTokens.mono, fontSize: 10, color: SagaTokens.inkSoft, letterSpacing: 1.4, textTransform: 'uppercase' }}>
        <div>← Aftur</div><div>Mat á orði</div>
      </div>

      <div style={{ marginTop: 22, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}><RuneStrip color={SagaTokens.teal} /></div>
        <div style={{ fontFamily: SagaTokens.mono, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: SagaTokens.inkSoft }}>Orðið var</div>
        <div style={{ fontFamily: SagaTokens.serif, fontSize: 44, lineHeight: 1.05, letterSpacing: -1, marginTop: 6 }}>elding</div>
        <div style={{ fontFamily: SagaTokens.mono, fontSize: 11, color: SagaTokens.inkSoft, marginTop: 4 }}>nafnorð · ‘lightning’</div>
      </div>

      <div style={{ marginTop: 26, marginBottom: 12 }}>
        <div style={{ fontFamily: SagaTokens.serif, fontSize: 22, lineHeight: 1.1 }}>Hversu þungt var orðið?</div>
        <div style={{ fontFamily: SagaTokens.mono, fontSize: 11, color: SagaTokens.inkSoft, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>Rate the difficulty</div>
      </div>

      <div style={{ display: 'grid', gap: 8, marginBottom: 'auto' }}>
        {ratings.map((r) => {
          const sel = rating === r.id;
          return (
            <StoneTile key={r.id} onClick={() => setRating(r.id)}
              color={sel ? r.color : SagaTokens.card}
              fg={sel ? SagaTokens.bg : SagaTokens.ink}
              radius={12}
              style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontFamily: SagaTokens.mono, fontSize: 16, letterSpacing: 2, width: 40 }}>{r.glyph}</span>
                <span style={{ fontFamily: SagaTokens.serif, fontSize: 22, fontStyle: sel ? 'italic' : 'normal' }}>{r.label}</span>
              </div>
              <span style={{ fontFamily: SagaTokens.mono, fontSize: 10, opacity: 0.7, letterSpacing: 1.2, textTransform: 'uppercase' }}>{r.en}</span>
            </StoneTile>
          );
        })}
      </div>

      <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
        <StoneTile color={SagaTokens.teal} fg={SagaTokens.bg} radius={14}
          style={{ padding: '15px 0', textAlign: 'center', fontFamily: SagaTokens.serif, fontStyle: 'italic', fontSize: 22 }}>
          Næsta orð →
        </StoneTile>
      </div>
    </div>
  );
}

// Summary
function SagaSummary() {
  const played = [
    { word: 'eldfjall',      cat: 'nafnorð', rating: 'easy' },
    { word: 'dansa',         cat: 'sagnorð', rating: 'medium' },
    { word: 'elding',        cat: 'nafnorð', rating: 'easy' },
    { word: 'alþingi',       cat: 'örnefni', rating: 'hard' },
    { word: 'ráðherra',      cat: 'nafnorð', rating: 'skipped' },
    { word: 'Þingvallavatn', cat: 'örnefni', rating: 'hard' },
  ];
  const map = {
    easy:    { color: SagaTokens.forest, label: 'Létt', glyph: '·' },
    medium:  { color: SagaTokens.ochre,  label: 'Mið',  glyph: '··' },
    hard:    { color: SagaTokens.rust,   label: 'Þungt',glyph: '···' },
    skipped: { color: SagaTokens.inkSoft,label: 'Slept',glyph: '↷' },
  };
  return (
    <div style={{ background: SagaTokens.bg, minHeight: '100%', fontFamily: SagaTokens.font, color: SagaTokens.ink, padding: '12px 22px 28px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: SagaTokens.mono, fontSize: 10, color: SagaTokens.inkSoft, letterSpacing: 1.4, textTransform: 'uppercase' }}>Lokakafli</div>
        <RuneStrip color={SagaTokens.teal} />
      </div>

      <div style={{ textAlign: 'center', marginTop: 22 }}>
        <div style={{ fontFamily: SagaTokens.mono, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: SagaTokens.inkSoft }}>~ Sögulokum ~</div>
        <div style={{ fontFamily: SagaTokens.serif, fontSize: 44, lineHeight: 1, letterSpacing: -1, marginTop: 6 }}>Vel barist!</div>
      </div>

      {/* Hero stats card */}
      <div style={{ marginTop: 18, marginBottom: 22 }}>
        <StoneTile color={SagaTokens.teal} fg={SagaTokens.bg} radius={18}
          style={{ padding: '20px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', textAlign: 'center', gap: 10 }}>
          {[
            { n: '6',  l: 'orð' },
            { n: '4',  l: 'lærð' },
            { n: '2', l: 'þung' },
          ].map((s, i) => (
            <div key={i} style={{ borderRight: i < 2 ? '1px solid rgba(236,225,199,0.3)' : 'none', paddingRight: i < 2 ? 4 : 0 }}>
              <div style={{ fontFamily: SagaTokens.serif, fontSize: 36, lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontFamily: SagaTokens.mono, fontSize: 9, opacity: 0.85, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </StoneTile>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ height: 1, flex: 1, background: SagaTokens.ink, opacity: 0.3 }} />
        <div style={{ fontFamily: SagaTokens.mono, fontSize: 10, color: SagaTokens.inkSoft, letterSpacing: 1.5, textTransform: 'uppercase' }}>Orðin</div>
        <div style={{ height: 1, flex: 1, background: SagaTokens.ink, opacity: 0.3 }} />
      </div>

      <div style={{ display: 'grid', gap: 8, marginBottom: 22 }}>
        {played.map((p, i) => {
          const m = map[p.rating];
          return (
            <StoneTile key={i} color={SagaTokens.card} radius={10}
              style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontFamily: SagaTokens.mono, fontSize: 10, color: SagaTokens.inkSoft }}>{String(i+1).padStart(2,'0')}</span>
                <span style={{ fontFamily: SagaTokens.serif, fontSize: 18 }}>{p.word}</span>
                <span style={{ fontFamily: SagaTokens.mono, fontSize: 9, color: SagaTokens.inkSoft, letterSpacing: 1, textTransform: 'uppercase' }}>{p.cat}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: SagaTokens.mono, fontSize: 12, color: m.color, letterSpacing: 1 }}>{m.glyph}</span>
                <span style={{ fontFamily: SagaTokens.mono, fontSize: 10, color: m.color, letterSpacing: 1, textTransform: 'uppercase' }}>{m.label}</span>
              </div>
            </StoneTile>
          );
        })}
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        <StoneTile color={SagaTokens.ochre} fg={SagaTokens.bg} radius={14}
          style={{ padding: '15px 0', textAlign: 'center', fontFamily: SagaTokens.serif, fontStyle: 'italic', fontSize: 22 }}>
          Aftur í leik
        </StoneTile>
        <StoneTile color={SagaTokens.card} radius={12}
          style={{ padding: '13px 0', textAlign: 'center', fontFamily: SagaTokens.serif, fontSize: 18 }}>
          Aðalvalmynd
        </StoneTile>
      </div>
    </div>
  );
}

Object.assign(window, { SagaTokens, SagaSetup, SagaPlay, SagaReview, SagaSummary });
