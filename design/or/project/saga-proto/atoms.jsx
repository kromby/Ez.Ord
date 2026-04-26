// Saga prototype — clickable flow.
// Stateful 4-screen Icelandic word-game prototype with Nordic-vintage aesthetic.

const { useState, useEffect, useMemo, useRef } = React;

// ─── Tokens (hooked into tweakable theme) ───────────────────────────────────
function makeTokens(t) {
  const palettes = {
    parchment: {
      bg: '#ece1c7', bgDeep: '#dccfaf', card: '#f6ecd2',
      ink: '#1c2a2c', inkSoft: '#4d5a5a',
      teal: '#114a4a', tealMid: '#1f6b66',
      ochre: '#c08a1a', ochreLight: '#e3b34a',
      rust: '#a4421f', forest: '#3a5d33',
    },
    midnight: {
      bg: '#1a2426', bgDeep: '#111a1c', card: '#243234',
      ink: '#ece1c7', inkSoft: '#a09686',
      teal: '#5fbab3', tealMid: '#3e8c87',
      ochre: '#e3b34a', ochreLight: '#f1cf7e',
      rust: '#e07b54', forest: '#7fb474',
    },
    fjord: {
      bg: '#dde7e7', bgDeep: '#c8d6d6', card: '#eaf1f1',
      ink: '#0f2326', inkSoft: '#48646a',
      teal: '#0a4a4d', tealMid: '#1a6d70',
      ochre: '#b8742d', ochreLight: '#dca35c',
      rust: '#a13b22', forest: '#39603a',
    },
  };
  return {
    ...palettes[t.palette || 'parchment'],
    serifWeight: t.serifWeight === 'heavy' ? 700 : 400,
    runeIntensity: t.runeIntensity ?? 0.85,
    font: '"Familjen Grotesk", "Inter", system-ui, sans-serif',
    serif: '"DM Serif Display", "EB Garamond", Georgia, serif',
    mono: '"JetBrains Mono", ui-monospace, monospace',
  };
}

// ─── Sample data ─────────────────────────────────────────────────────────────
const WORDS = [
  { word: 'eldfjall',      cat: 'nafnorð', en: 'volcano' },
  { word: 'dansa',         cat: 'sagnorð', en: 'to dance' },
  { word: 'elding',        cat: 'nafnorð', en: 'lightning' },
  { word: 'alþingi',       cat: 'örnefni', en: 'parliament' },
  { word: 'ráðherra',      cat: 'nafnorð', en: 'minister' },
  { word: 'Þingvallavatn', cat: 'örnefni', en: 'lake name' },
];

const CATS = [
  { id: 'nafn',  label: 'Nafnorð',     en: 'Nouns',       count: 482 },
  { id: 'sagn',  label: 'Sagnorð',     en: 'Verbs',       count: 318 },
  { id: 'lys',   label: 'Lýsingarorð', en: 'Adjectives',  count: 214 },
  { id: 'orne',  label: 'Örnefni',     en: 'Place names', count: 96 },
];

const GAMES = [
  { id: 'teikna',  label: 'Teikna',      emoji: '✏️' },
  { id: 'utskyra', label: 'Útskýra',     emoji: '💬' },
  { id: 'leika',   label: 'Leika',       emoji: '🎭' },
];

// ─── Atoms ───────────────────────────────────────────────────────────────────
function RuneStrip({ tk, color, opacity }) {
  const c = color || tk.teal;
  const o = opacity ?? tk.runeIntensity;
  const glyphs = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ','ᛁ','ᛃ'];
  return <div style={{ fontSize: 10, letterSpacing: 6, color: c, opacity: o, fontFamily: 'serif' }}>{glyphs.join('')}</div>;
}

function Stone({ children, tk, color, fg, selected, onClick, style = {}, radius = 14, border, depth = 2, role }) {
  const b = border || tk.ink;
  const bg = color || tk.card;
  const text = fg || tk.ink;
  const [pressed, setPressed] = useState(false);
  return (
    <div role={role}
      onMouseDown={() => onClick && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onClick={onClick}
      style={{
        background: bg, color: text,
        borderRadius: radius,
        border: `1.5px solid ${b}`,
        boxShadow: pressed
          ? `0 0 0 ${b}`
          : selected
            ? `inset 0 0 0 3px ${bg}, inset 0 0 0 4.5px ${b}, 0 ${depth + 2}px 0 ${b}`
            : `0 ${depth}px 0 ${b}`,
        cursor: onClick ? 'pointer' : 'default',
        transform: pressed ? `translateY(${depth}px)` : 'none',
        transition: 'transform 70ms ease, box-shadow 70ms ease',
        position: 'relative',
        ...style,
      }}>{children}</div>
  );
}

function Divider({ tk, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0' }}>
      <div style={{ height: 1, flex: 1, background: tk.ink, opacity: 0.25 }} />
      {label && <div style={{ fontFamily: tk.mono, fontSize: 10, color: tk.inkSoft, letterSpacing: 1.5, textTransform: 'uppercase' }}>{label}</div>}
      <div style={{ height: 1, flex: 1, background: tk.ink, opacity: 0.25 }} />
    </div>
  );
}

Object.assign(window, { makeTokens, WORDS, CATS, GAMES, RuneStrip, Stone, Divider });
