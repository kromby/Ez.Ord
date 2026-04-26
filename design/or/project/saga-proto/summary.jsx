// Saga prototype — Summary screen.

function SummaryScreen({ tk, state, dispatch }) {
  const map = {
    easy: { color: tk.forest, label: 'Létt', glyph: '·' },
    medium: { color: tk.ochre, label: 'Mið', glyph: '··' },
    hard: { color: tk.rust, label: 'Þungt', glyph: '···' },
    skipped: { color: tk.inkSoft, label: 'Sleppt', glyph: '↷' }
  };
  const played = state.played;
  const counts = played.reduce((a, p) => ({ ...a, [p.rating]: (a[p.rating] || 0) + 1 }), {});
  const learned = (counts.easy || 0) + (counts.medium || 0);

  return (
    <div style={{ background: tk.bg, minHeight: '100%', fontFamily: tk.font, color: tk.ink, padding: '14px 22px 28px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: tk.mono, fontSize: 10, color: tk.inkSoft, letterSpacing: 1.4, textTransform: 'uppercase' }}>Lokakafli</div>
        <RuneStrip tk={tk} />
      </div>

      <div style={{ marginTop: 18, marginBottom: 22 }}>
        <Stone tk={tk} color={tk.teal} fg={tk.bg} radius={18} depth={4}
        style={{ padding: '20px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', textAlign: 'center', gap: 10 }}>
          {[
          { n: String(played.length), l: 'orð' },
          { n: String(counts.skipped || 0), l: 'sleppt' },
          { n: String(counts.hard || 0), l: 'þung' }].
          map((s, i) =>
          <div key={i} style={{ borderRight: i < 2 ? `1px solid ${tk.bg}33` : 'none' }}>
              <div style={{ fontFamily: tk.serif, fontSize: 36, lineHeight: 1, fontWeight: tk.serifWeight }}>{s.n}</div>
              <div style={{ fontFamily: tk.mono, fontSize: 9, opacity: 0.85, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 4 }}>{s.l}</div>
            </div>
          )}
        </Stone>
      </div>

      <Divider tk={tk} label="Orðin" />

      <div style={{ display: 'grid', gap: 8, marginTop: 12, marginBottom: 22 }}>
        {played.map((p, i) => {
          const m = map[p.rating];
          return (
            <Stone key={i} tk={tk} radius={10} depth={1}
            style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, minWidth: 0 }}>
                <span style={{ fontFamily: tk.mono, fontSize: 10, color: tk.inkSoft }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ fontFamily: tk.serif, fontSize: 18, fontWeight: tk.serifWeight, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.word}</span>
                <span style={{ fontFamily: tk.mono, fontSize: 9, color: tk.inkSoft, letterSpacing: 1, textTransform: 'uppercase' }}>{p.cat}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <span style={{ fontFamily: tk.mono, fontSize: 12, color: m.color, letterSpacing: 1 }}>{m.glyph}</span>
                <span style={{ fontFamily: tk.mono, fontSize: 10, color: m.color, letterSpacing: 1, textTransform: 'uppercase' }}>{m.label}</span>
              </div>
            </Stone>);

        })}
      </div>

      <div style={{ display: 'grid', gap: 10, marginTop: 'auto' }}>
        <Stone tk={tk} color={tk.ochre} fg={tk.bg} depth={3}
        onClick={() => dispatch({ type: 'playAgain' })}
        style={{ padding: '13px 0', textAlign: 'center', fontFamily: tk.serif, fontStyle: 'italic', fontSize: 18, fontWeight: tk.serifWeight }}>
          Aftur í leik
        </Stone>
        <Stone tk={tk}
        onClick={() => dispatch({ type: 'menu' })}
        style={{ padding: '13px 0', textAlign: 'center', fontFamily: tk.serif, fontSize: 18, fontWeight: tk.serifWeight }}>
          Aðalvalmynd
        </Stone>
      </div>
    </div>);

}

window.SummaryScreen = SummaryScreen;