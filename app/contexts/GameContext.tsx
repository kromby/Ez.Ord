import React, { createContext, useReducer, ReactNode } from 'react';

import { WORDS } from '../constants/words';

// Type definitions
export type GameType = 'teikna' | 'utskyra' | 'leika';
export type Category = 'nafn' | 'sagn' | 'lys' | 'orne';
export type Rating = 'easy' | 'medium' | 'hard' | 'skipped';
export type Route = 'menu' | 'game' | 'review';

// Interfaces
export interface PlayedWord {
  id: string;
  word: string;
  category: Category;
  rating: Rating;
}

export interface GameState {
  route: Route;
  game: GameType | null;
  categories: Record<Category, boolean>;
  wordIndex: number;
  playedWords: PlayedWord[];
  currentRating: Rating | null;
}

// Initial state
export const INITIAL_STATE: GameState = {
  route: 'menu',
  game: null,
  categories: {
    nafn: true,
    sagn: true,
    lys: true,
    orne: true,
  },
  wordIndex: 0,
  playedWords: [],
  currentRating: null,
};

// Action types
export type GameAction =
  | { type: 'SET_GAME'; payload: GameType }
  | { type: 'TOGGLE_CATEGORY'; payload: Category }
  | { type: 'START_GAME' }
  | { type: 'GO_TO_REVIEW' }
  | { type: 'SET_RATING'; payload: Rating }
  | { type: 'NEXT_WORD' }
  | { type: 'PLAY_AGAIN' }
  | { type: 'END_GAME' }
  | { type: 'GO_TO_MENU' };

// Reducer function
export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'SET_GAME':
      return {
        ...state,
        game: action.payload,
      };

    case 'TOGGLE_CATEGORY':
      return {
        ...state,
        categories: {
          ...state.categories,
          [action.payload]: !state.categories[action.payload],
        },
      };

    case 'START_GAME':
      return {
        ...state,
        route: 'game',
        wordIndex: 0,
        playedWords: [],
        currentRating: null,
      };

    case 'GO_TO_REVIEW':
      return {
        ...state,
        route: 'review',
      };

    case 'SET_RATING':
      return {
        ...state,
        currentRating: action.payload,
      };

    case 'NEXT_WORD': {
      if (state.wordIndex >= WORDS.length) {
        return state; // No more words available
      }

      const currentWord = WORDS[state.wordIndex];
      const newPlayedWord: PlayedWord = {
        id: currentWord.id,
        word: currentWord.word,
        category: currentWord.category,
        rating: state.currentRating || 'skipped',
      };

      return {
        ...state,
        playedWords: [...state.playedWords, newPlayedWord],
        wordIndex: state.wordIndex + 1,
        currentRating: null,
      };
    }

    case 'PLAY_AGAIN':
      return {
        ...state,
        route: 'game',
        wordIndex: 0,
        playedWords: [],
        currentRating: null,
      };

    case 'END_GAME':
      return {
        ...state,
        route: 'menu',
        game: null,
        wordIndex: 0,
        playedWords: [],
        currentRating: null,
      };

    case 'GO_TO_MENU':
      return {
        ...state,
        route: 'menu',
        game: null,
        wordIndex: 0,
        playedWords: [],
        currentRating: null,
      };

    default:
      return state;
  }
};

// Context
interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export const GameContext = createContext<GameContextType>({
  state: INITIAL_STATE,
  dispatch: () => {},
});

// Provider component
export interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};
