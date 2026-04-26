// Saga prototype — Review screen.
// Show same word, three difficulty pegs, Next/Skip footer.

function ReviewScreen({ tk, state, dispatch }) {
  const w = WORDS[state.idx % WORDS.length];
  const [confirmEnd, setConfirmEnd] = useState(false);

  // Auto-advance when user picks a rating.
  const handleRate = (rating) => {
    dispatch({ type: 'rate', rating });
    setTimeout(() => dispatch({ type: 'next' }), 220);
  };

  const ratings = [
  { id: 'easy', label: 'Létt', color: tk.forest, glyph: '·' },
  { id: 'medium', label: 'Mið', color: tk.ochre, glyph: '··' },
  { id: 'hard', label: 'Þungt', color: tk.rust, glyph: '···' }];


  return (
    <div style={{ background: tk.bg, minHeight: '100%', fontFamily: tk.font, color: tk.ink, padding: '14px 22px 28px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div onClick={() => dispatch({ type: 'back' })} style={{ fontFamily: tk.mono, fontSize: 10, color: tk.inkSoft, letterSpacing: 1.4, textTransform: 'uppercase', cursor: 'pointer' }}>← Aftur</div>
        <div onClick={() => setConfirmEnd(true)} style={{ fontFamily: tk.mono, fontSize: 10, color: tk.rust, letterSpacing: 1.4, textTransform: 'uppercase', cursor: 'pointer' }}>Hætta</div>
      </div>

      <div style={{ marginTop: 22, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}><RuneStrip tk={tk} /></div>
        <div style={{ fontFamily: tk.mono, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: tk.inkSoft }}>Orðið var</div>
        <div style={{ fontFamily: tk.serif, fontSize: w.word.length > 9 ? 54 : 66, lineHeight: 1.05, letterSpacing: -1.5, marginTop: 6, fontWeight: tk.serifWeight }}>{w.word}</div>
        <div style={{ fontFamily: tk.mono, fontSize: 11, color: tk.inkSoft, marginTop: 4 }}>{w.cat}</div>
      </div>

      <div style={{ marginTop: 26, marginBottom: 12 }}>
        <div style={{ fontFamily: tk.serif, fontSize: 22, lineHeight: 1.1, fontWeight: tk.serifWeight }}>Hversu erfitt var orðið?</div>
      </div>

      <div style={{ display: 'grid', gap: 8, marginBottom: 'auto' }}>
        {ratings.map((r) => {
          const sel = state.rating === r.id;
          return (
            <Stone key={r.id} tk={tk}
            onClick={() => handleRate(r.id)}
            color={sel ? r.color : tk.card}
            fg={sel ? tk.bg : tk.ink}
            selected={sel}
            style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontFamily: tk.mono, fontSize: 16, letterSpacing: 2, width: 40 }}>{r.glyph}</span>
                <span style={{ fontFamily: tk.serif, fontSize: 22, fontStyle: sel ? 'italic' : 'normal', fontWeight: tk.serifWeight }}>{r.label}</span>
              </div>
            </Stone>);

        })}
      </div>

      <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
        <Stone tk={tk}
        color={tk.teal}
        fg={tk.bg}
        depth={4}
        onClick={() => dispatch({ type: 'next' })}
        style={{ padding: '15px 0', textAlign: 'center', fontFamily: tk.serif, fontStyle: 'italic', fontSize: 22, fontWeight: tk.serifWeight }}>
          Fá annað orð →
        </Stone>
      </div>

      {confirmEnd && (
        <div onClick={() => setConfirmEnd(false)} style={{
          position: 'absolute', inset: 0, background: 'rgba(28,42,44,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
          backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
          animation: 'sagaFade 200ms ease',
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 320 }}>
            <Stone tk={tk} radius={18} depth={4} style={{ padding: '20px 18px', textAlign: 'center' }}>
              <RuneStrip tk={tk} />
              <div style={{ fontFamily: tk.serif, fontSize: 24, marginTop: 8, lineHeight: 1.1, fontWeight: tk.serifWeight }}>Hætta leik?</div>
              <div style={{ fontFamily: tk.mono, fontSize: 11, color: tk.inkSoft, marginTop: 6, marginBottom: 18 }}>Saga þín er ekki á enda.</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <Stone tk={tk} onClick={() => setConfirmEnd(false)}
                  style={{ padding: '12px 0', textAlign: 'center', fontFamily: tk.serif, fontSize: 16, fontWeight: tk.serifWeight }}>
                  Halda áfram
                </Stone>
                <Stone tk={tk} color={tk.rust} fg={tk.bg}
                  onClick={() => { setConfirmEnd(false); dispatch({ type: 'end' }); }}
                  style={{ padding: '12px 0', textAlign: 'center', fontFamily: tk.serif, fontSize: 16, fontStyle: 'italic', fontWeight: tk.serifWeight }}>
                  Hætta
                </Stone>
              </div>
            </Stone>
          </div>
        </div>
      )}
    </div>);

}

window.ReviewScreen = ReviewScreen;