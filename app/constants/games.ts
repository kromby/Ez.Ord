// Game definitions and metadata

const GAMES = [
  {
    id: 'teikna',
    label: 'Teikna',
    icon: '🎨',
    description: 'Teiknaðu og gissaðu myndir',
  },
  {
    id: 'utskyra',
    label: 'Útskýra',
    icon: '💬',
    description: 'Útskýrðu orð án þess að sýna þau',
  },
  {
    id: 'leika',
    label: 'Leika',
    icon: '🎭',
    description: 'Leikaðu orð upp fyrir aðra að giska á',
  },
] as const;

// Derive GameId type from GAMES array
type GameId = typeof GAMES[number]['id'];

export { GAMES, type GameId };
