export interface Game {
  gameId: string;
  gameType: 'drawing' | 'scrabble' | 'word_explanation' | 'acting';
  categories: string[];
  startedAt: string;
  endedAt?: string;
}

export interface Word {
  word: string;
  category: string;
  typeName?: string;
  wordId: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface GameSetupParams {
  gameType: 'drawing' | 'scrabble' | 'word_explanation' | 'acting';
  categories: string[];
}

export interface RatingPayload {
  wordId: string;
  difficultyRating: 'easy' | 'medium' | 'hard';
}

export interface SkipPayload {
  wordId: string;
}

export interface GameWordDetails {
  sequence: number;
  word: string;
  category: string;
  drawnAt: string;
  rating?: 'easy' | 'medium' | 'hard' | 'skipped';
}

export interface GameSummary {
  gameId: string;
  gameType: 'drawing' | 'scrabble' | 'word_explanation' | 'acting';
  categories: string[];
  startedAt: string;
  endedAt?: string;
  words: GameWordDetails[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
