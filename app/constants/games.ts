// Game definitions and metadata

const GAMES = [
  {
    id: 'teikna',
    label: 'Teikna',
    icon: '🎨',
    description: 'Draw and guess pictures',
  },
  {
    id: 'utskyra',
    label: 'Útskýra',
    icon: '💬',
    description: 'Explain words without showing them',
  },
  {
    id: 'leika',
    label: 'Leika',
    icon: '🎭',
    description: 'Act out words for others to guess',
  },
] as const;

// Derive GameId type from GAMES array
type GameId = typeof GAMES[number]['id'];

export { GAMES, type GameId };
