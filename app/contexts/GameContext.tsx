import React, { createContext, useReducer, ReactNode, useCallback } from 'react';

import { WORDS, type Category } from '@/constants/words';
import gameAPI from '@/app/services/api';
import type { GameSetupParams } from '@/app/types/game';

// Type definitions
export type { Category };
export type GameType = 'teikna' | 'utskyra' | 'leika';
export type Rating = 'easy' | 'medium' | 'hard' | 'skipped';
export type Route = 'menu' | 'game' | 'review' | 'summary';

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
  gameId: string | null;
  categories: Record<Category, boolean>;
  wordIndex: number;
  playedWords: PlayedWord[];
  currentRating: Rating | null;
  isLoading: boolean;
  error: string | null;
}

// Initial state
export const INITIAL_STATE: GameState = {
  route: 'menu',
  game: null,
  gameId: null,
  categories: {
    nafn: true,
    sagn: true,
    lys: true,
    orne: true,
  },
  wordIndex: 0,
  playedWords: [],
  currentRating: null,
  isLoading: false,
  error: null,
};

// Action types
export type GameAction =
  | { type: 'SET_GAME'; payload: GameType }
  | { type: 'TOGGLE_CATEGORY'; payload: Category }
  | { type: 'START_GAME' }
  | { type: 'START_GAME_SUCCESS'; payload: string }
  | { type: 'GO_TO_REVIEW' }
  | { type: 'SET_RATING'; payload: Rating }
  | { type: 'NEXT_WORD' }
  | { type: 'PLAY_AGAIN' }
  | { type: 'END_GAME' }
  | { type: 'GO_TO_MENU' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

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
        isLoading: true,
        error: null,
      };

    case 'START_GAME_SUCCESS':
      return {
        ...state,
        route: 'game',
        gameId: action.payload,
        wordIndex: 0,
        playedWords: [],
        currentRating: null,
        isLoading: false,
        error: null,
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

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };

    default:
      return state;
  }
};

// Context
interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  startGameAsync: (gameType: GameType, categories: Category[]) => Promise<void>;
  rateWordAsync: (rating: Rating) => Promise<void>;
  skipWordAsync: () => Promise<void>;
  endGameAsync: () => Promise<void>;
}

export const GameContext = createContext<GameContextType>({
  state: INITIAL_STATE,
  dispatch: () => {},
  startGameAsync: async () => {},
  rateWordAsync: async () => {},
  skipWordAsync: async () => {},
  endGameAsync: async () => {},
});

// Provider component
export interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);

  const startGameAsync = useCallback(async (gameType: GameType, categories: Category[]) => {
    dispatch({ type: 'START_GAME' });
    try {
      const categoryIds = categories.filter(cat => state.categories[cat]);
      const params: GameSetupParams = {
        gameType,
        categories: categoryIds,
      };
      const game = await gameAPI.startGame(params);
      dispatch({ type: 'START_GAME_SUCCESS', payload: game.gameId });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to start game',
      });
    }
  }, [state.categories]);

  const rateWordAsync = useCallback(async (rating: Rating) => {
    if (!state.gameId || state.wordIndex >= WORDS.length) return;

    dispatch({ type: 'SET_RATING', payload: rating });
    try {
      const currentWord = WORDS[state.wordIndex];
      if (rating !== 'skipped') {
        await gameAPI.rateWord(state.gameId, {
          wordId: currentWord.id,
          difficultyRating: rating as 'easy' | 'medium' | 'hard',
        });
      }
      dispatch({ type: 'NEXT_WORD' });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to rate word',
      });
    }
  }, [state.gameId, state.wordIndex]);

  const skipWordAsync = useCallback(async () => {
    if (!state.gameId || state.wordIndex >= WORDS.length) return;

    try {
      const currentWord = WORDS[state.wordIndex];
      await gameAPI.skipWord(state.gameId, { wordId: currentWord.id });
      dispatch({ type: 'SET_RATING', payload: 'skipped' });
      dispatch({ type: 'NEXT_WORD' });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to skip word',
      });
    }
  }, [state.gameId, state.wordIndex]);

  const endGameAsync = useCallback(async () => {
    if (!state.gameId) return;

    try {
      await gameAPI.endGame(state.gameId);
      dispatch({ type: 'END_GAME' });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to end game',
      });
    }
  }, [state.gameId]);

  return (
    <GameContext.Provider
      value={{
        state,
        dispatch,
        startGameAsync,
        rateWordAsync,
        skipWordAsync,
        endGameAsync,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
