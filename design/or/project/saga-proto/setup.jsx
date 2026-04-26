// Saga prototype — Setup screen.
// Game type select + categories multiselect + Start CTA.

function SetupScreen({ tk, state, dispatch }) {
  const sel = Object.values(state.cats).filter(Boolean).length;

  return (
    <div style={{ background: tk.bg, minHeight: '100%', fontFamily: tk.font, color: tk.ink, padding: '14px 22px 28px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
        <div style={{ fontFamily: tk.mono, fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase', color: tk.inkSoft }}>Orð · Kafli I</div>
        <RuneStrip tk={tk} />
      </div>

      <h1 style={{ fontFamily: tk.serif, fontSize: 44, lineHeight: 0.95, margin: '20px 0 4px', fontWeight: tk.serifWeight, letterSpacing: -0.5 }}>
        Veldu þinn<br /><span style={{ fontStyle: 'italic', color: tk.teal }}>orðaleik</span>
      </h1>
      <Divider tk={tk} label="leikir" />

      {/* Game types */}
      <div style={{ display: 'grid', gap: 10, marginTop: 14, marginBottom: 24 }}>
        {GAMES.map((g) => {
          const isSel = state.game === g.id;
          return (
            <Stone key={g.id} tk={tk}
            onClick={() => dispatch({ type: 'setGame', id: g.id })}
            color={isSel ? tk.teal : tk.card}
            fg={isSel ? tk.bg : tk.ink}
            style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: isSel ? tk.ochreLight : tk.bgDeep,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                border: `1.5px solid ${tk.ink}`, flexShrink: 0
              }}>{g.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: tk.serif, fontSize: 22, lineHeight: 1, fontStyle: isSel ? 'italic' : 'normal', fontWeight: tk.serifWeight }}>{g.label}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, opacity: isSel ? 1 : 0.4 }}>{isSel ? '◆' : '◇'}</div>
            </Stone>);

        })}
      </div>

      <div style={{ fontFamily: tk.mono, fontSize: 10, color: tk.inkSoft, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>· Orðaflokkar · {sel}/4</div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
        {CATS.map((c) => {
          const on = state.cats[c.id];
          return (
            <Stone key={c.id} tk={tk}
            onClick={() => dispatch({ type: 'toggleCat', id: c.id })}
            color={on ? tk.ochreLight : tk.card}
            radius={999}
            style={{ padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12 }}>{on ? '✦' : '◌'}</span>
              <span style={{ fontFamily: tk.serif, fontStyle: on ? 'italic' : 'normal', fontSize: 16, fontWeight: tk.serifWeight }}>{c.label}</span>
              <span style={{ fontFamily: tk.mono, fontSize: 10, opacity: 0.6 }}>{c.count}</span>
            </Stone>);

        })}
      </div>

      <div style={{ marginTop: 'auto' }}>
      <Stone tk={tk}
      color={sel > 0 ? tk.teal : tk.bgDeep}
      fg={sel > 0 ? tk.bg : tk.inkSoft}
      depth={sel > 0 ? 4 : 1}
      onClick={sel > 0 ? () => dispatch({ type: 'start' }) : undefined}
      style={{ padding: '16px 0', textAlign: 'center', opacity: sel > 0 ? 1 : 0.6 }}>
        <div style={{ fontFamily: tk.serif, fontStyle: 'italic', fontSize: 22, fontWeight: tk.serifWeight }}>Hefjum leik →</div>
        {sel === 0 && (
          <div style={{ fontFamily: tk.mono, fontSize: 9, opacity: 0.7, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 2 }}>
            Veldu a.m.k. einn flokk
          </div>
        )}
      </Stone>
      </div>
    </div>);

}

window.SetupScreen = SetupScreen;