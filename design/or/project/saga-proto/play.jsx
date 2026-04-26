// Saga prototype — Play screen.
// Big word card, three actions: Skoða svar (Review), Sleppa (Skip), Hætta (End).

function PlayScreen({ tk, state, dispatch }) {
  const w = WORDS[state.idx % WORDS.length];
  const game = GAMES.find((g) => g.id === state.game) || GAMES[2];

  return (
    <div style={{ background: tk.bg, minHeight: '100%', fontFamily: tk.font, color: tk.ink, padding: '14px 22px 28px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>{game.emoji}</span>
          <div>
            <div style={{ fontFamily: tk.serif, fontStyle: 'italic', fontSize: 16, lineHeight: 1, fontWeight: tk.serifWeight }}>{game.label}</div>
          </div>
        </div>
        <div style={{ fontFamily: tk.mono, fontSize: 10, color: tk.inkSoft, letterSpacing: 1.4, textTransform: 'uppercase' }}>Orð #{state.idx + 1}</div>
      </div>

      {/* Word card */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '20px 0' }}>
        <Stone tk={tk} radius={20} depth={4}
          style={{ padding: '24px 18px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 360 }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <RuneStrip tk={tk} />
          </div>
          <div key={state.idx} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: tk.serif, fontSize: w.word.length > 9 ? 56 : 78, lineHeight: 1, letterSpacing: -2, fontWeight: tk.serifWeight, animation: 'sagaFade 320ms ease' }}>
            {w.word}
          </div>
          <div style={{ fontFamily: tk.mono, fontSize: 12, color: tk.inkSoft, letterSpacing: 1.2, textTransform: 'uppercase' }}>
            {w.cat}
          </div>
        </Stone>
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        <Stone tk={tk}
          color={tk.teal} fg={tk.bg}
          depth={3}
          onClick={() => dispatch({ type: 'review' })}
          style={{ padding: '15px 0', textAlign: 'center', fontFamily: tk.serif, fontStyle: 'italic', fontSize: 20, fontWeight: tk.serifWeight }}>
          Fá annað orð →
        </Stone>
        <Stone tk={tk}
          color={tk.ochreLight}
          onClick={() => dispatch({ type: 'review' })}
          style={{ padding: '13px 0', textAlign: 'center', fontFamily: tk.serif, fontSize: 17, fontWeight: tk.serifWeight }}>
          Sleppa
        </Stone>
      </div>
    </div>
  );
}

window.PlayScreen = PlayScreen;
