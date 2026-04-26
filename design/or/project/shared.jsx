// Shared utilities for Orð design canvas.

// Sample data.
const SAMPLE_WORDS = [
  { word: 'eldfjall',       cat: 'nafnorð',     en: 'volcano' },
  { word: 'dansa',          cat: 'sagnorð',     en: 'to dance' },
  { word: 'elding',         cat: 'nafnorð',     en: 'lightning' },
  { word: 'alþingi',        cat: 'örnefni',     en: 'parliament' },
  { word: 'ráðherra',       cat: 'nafnorð',     en: 'minister' },
  { word: 'Þingvallavatn',  cat: 'örnefni',     en: 'lake name' },
];

const CATEGORIES = [
  { id: 'nafn',  label: 'Nafnorð',     en: 'Nouns',      count: 482 },
  { id: 'sagn',  label: 'Sagnorð',     en: 'Verbs',      count: 318 },
  { id: 'lys',   label: 'Lýsingarorð', en: 'Adjectives', count: 214 },
  { id: 'orne',  label: 'Örnefni',     en: 'Place names', count: 96 },
];

const GAME_TYPES = [
  { id: 'teikna', label: 'Teikna',      en: 'Draw',     emoji: '✏️' },
  { id: 'stafir', label: 'Stafaleikur', en: 'Scrabble', emoji: '🎲' },
  { id: 'utskyra', label: 'Útskýra',    en: 'Explain',  emoji: '💬' },
  { id: 'leika',  label: 'Leika',       en: 'Act out',  emoji: '🎭' },
];

// Minimal status bar — black text, no chrome battery noise; we'll draw our own
// rectangle if needed. Use the iOS frame component for fidelity.

// Tiny inline icon helpers.
function Pip({ size = 6, color = '#222' }) {
  return <span style={{ width: size, height: size, borderRadius: 999, background: color, display: 'inline-block' }} />;
}

// Card with paper-grain feel — used by multiple directions.
function PaperCard({ children, style = {}, color = '#fdf6e8', shadow = '0 2px 0 rgba(0,0,0,0.08), 0 8px 22px rgba(60,40,20,0.12)', radius = 18, tilt = 0 }) {
  return (
    <div style={{
      background: color,
      borderRadius: radius,
      boxShadow: shadow,
      transform: tilt ? `rotate(${tilt}deg)` : undefined,
      position: 'relative',
      overflow: 'hidden',
      ...style,
    }}>
      {/* subtle grain via repeating linear gradient */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage:
          'radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '3px 3px, 5px 5px',
        backgroundPosition: '0 0, 1px 2px',
        mixBlendMode: 'multiply',
        opacity: 0.7,
      }} />
      <div style={{ position: 'relative' }}>{children}</div>
    </div>
  );
}

Object.assign(window, { SAMPLE_WORDS, CATEGORIES, GAME_TYPES, Pip, PaperCard });
