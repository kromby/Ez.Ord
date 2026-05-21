import React, { createContext, useReducer, ReactNode, useCallback, useRef } from 'react';

import gameAPI from '@/app/services/api';
import type { Category, GameSetupParams, Word } from '@/app/types/game';

// Type definitions
export type GameType = 'teikna' | 'utskyra' | 'leika';
export type Rating = 'easy' | 'medium' | 'hard';
export type Route = 'menu' | 'game' | 'review' | 'summary';

// Interfaces
export interface PlayedWord {
  id: string;
  word: string;
  category: string;
  rating: Rating;
  skipped: boolean;
}

export interface GameState {
  route: Route;
  game: GameType | null;
  gameId: string | null;
  availableCategories: Category[];
  selectedCategories: Record<string, boolean>;
  wordIndex: number;
  playedWords: PlayedWord[];
  currentWord: Word | null;
  nextWord: Word | null;
  currentRating: Rating | null;
  currentSkipped: boolean;
  isLoading: boolean;
  error: string | null;
}

// Initial state
export const INITIAL_STATE: GameState = {
  route: 'menu',
  game: null,
  gameId: null,
  availableCategories: [],
  selectedCategories: {},
  wordIndex: 0,
  playedWords: [],
  currentWord: null,
  nextWord: null,
  currentRating: null,
  currentSkipped: false,
  isLoading: false,
  error: null,
};

// Action types
export type GameAction =
  | { type: 'SET_GAME'; payload: GameType }
  | { type: 'SET_AVAILABLE_CATEGORIES'; payload: Category[] }
  | { type: 'TOGGLE_CATEGORY'; payload: string }
  | { type: 'START_GAME' }
  | { type: 'START_GAME_SUCCESS'; payload: string }
  | { type: 'GO_TO_REVIEW' }
  | { type: 'SET_RATING'; payload: Rating }
  | { type: 'SET_SKIPPED'; payload: boolean }
  | { type: 'SET_CURRENT_WORD'; payload: Word | null }
  | { type: 'SET_NEXT_WORD'; payload: Word | null }
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

    case 'SET_AVAILABLE_CATEGORIES': {
      const next: Record<string, boolean> = {};
      for (const cat of action.payload) {
        next[cat.id] = state.selectedCategories[cat.id] ?? true;
      }
      return {
        ...state,
        availableCategories: action.payload,
        selectedCategories: next,
      };
    }

    case 'TOGGLE_CATEGORY':
      return {
        ...state,
        selectedCategories: {
          ...state.selectedCategories,
          [action.payload]: !state.selectedCategories[action.payload],
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
        currentWord: null,
        nextWord: null,
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

    case 'SET_SKIPPED':
      return {
        ...state,
        currentSkipped: action.payload,
      };

    case 'SET_CURRENT_WORD':
      return {
        ...state,
        currentWord: action.payload,
      };

    case 'SET_NEXT_WORD':
      return {
        ...state,
        nextWord: action.payload,
      };

    case 'NEXT_WORD': {
      if (!state.currentWord) {
        return state;
      }

      const newPlayedWord: PlayedWord = {
        id: state.currentWord.wordId,
        word: state.currentWord.word,
        category: state.currentWord.category,
        rating: state.currentRating || 'medium',
        skipped: state.currentSkipped,
      };

      return {
        ...state,
        playedWords: [...state.playedWords, newPlayedWord],
        wordIndex: state.wordIndex + 1,
        currentWord: state.nextWord,
        nextWord: null,
        currentRating: null,
        currentSkipped: false,
      };
    }

    case 'PLAY_AGAIN':
      return {
        ...state,
        route: 'game',
        wordIndex: 0,
        playedWords: [],
        currentWord: null,
        nextWord: null,
        currentRating: null,
        currentSkipped: false,
      };

    case 'END_GAME':
      return {
        ...state,
        route: 'menu',
        game: null,
        wordIndex: 0,
        playedWords: [],
        currentWord: null,
        nextWord: null,
        currentRating: null,
        currentSkipped: false,
      };

    case 'GO_TO_MENU':
      return {
        ...state,
        route: 'menu',
        game: null,
        wordIndex: 0,
        playedWords: [],
        currentWord: null,
        nextWord: null,
        currentRating: null,
        currentSkipped: false,
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
        isLoading: false,
      };

    default:
      return state;
  }
};

// Context
interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  startGameAsync: (gameType: GameType, categories: string[]) => Promise<void>;
  loadCategoriesAsync: () => Promise<void>;
  fetchNextWordAsync: () => Promise<void>;
  prefetchNextWordAsync: () => Promise<void>;
  rateWordAsync: (rating: Rating) => Promise<void>;
  skipWordAsync: (rating: Rating) => Promise<void>;
  endGameAsync: () => Promise<void>;
}

export const GameContext = createContext<GameContextType>({
  state: INITIAL_STATE,
  dispatch: () => {},
  startGameAsync: async () => {},
  loadCategoriesAsync: async () => {},
  fetchNextWordAsync: async () => {},
  prefetchNextWordAsync: async () => {},
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
  const isPrefetchingRef = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  const loadCategoriesAsync = useCallback(async () => {
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const categories = await gameAPI.getCategories();
      dispatch({ type: 'SET_AVAILABLE_CATEGORIES', payload: categories });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to load categories',
      });
    }
  }, []);

  const startGameAsync = useCallback(async (gameType: GameType, categories: string[]) => {
    dispatch({ type: 'START_GAME' });
    try {
      const params: GameSetupParams = {
        gameType,
        categories,
      };
      const game = await gameAPI.startGame(params);
      dispatch({ type: 'START_GAME_SUCCESS', payload: game.gameId });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to start game',
      });
    }
  }, []);

  const fetchNextWordAsync = useCallback(async () => {
    if (!state.gameId) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const word = await gameAPI.getNextWord(state.gameId);
      dispatch({ type: 'SET_CURRENT_WORD', payload: word });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to fetch word',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.gameId]);

  const prefetchNextWordAsync = useCallback(async () => {
    const { gameId, nextWord } = stateRef.current;
    if (!gameId || nextWord || isPrefetchingRef.current) return;

    isPrefetchingRef.current = true;
    try {
      const word = await gameAPI.getNextWord(gameId);
      dispatch({ type: 'SET_NEXT_WORD', payload: word });
    } catch {
      // Silent: foreground fetch in play.tsx will fall back if buffer is empty.
    } finally {
      isPrefetchingRef.current = false;
    }
  }, []);

  const rateWordAsync = useCallback(async (rating: Rating) => {
    if (!state.gameId || !state.currentWord) return;

    dispatch({ type: 'SET_RATING', payload: rating });
    dispatch({ type: 'SET_SKIPPED', payload: false });
    try {
      await gameAPI.rateWord(state.gameId, {
        wordId: state.currentWord.wordId,
        difficultyRating: rating,
      });
      dispatch({ type: 'NEXT_WORD' });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to rate word',
      });
    }
  }, [state.gameId, state.currentWord]);

  const skipWordAsync = useCallback(async (rating: Rating) => {
    if (!state.gameId || !state.currentWord) return;

    dispatch({ type: 'SET_RATING', payload: rating });
    dispatch({ type: 'SET_SKIPPED', payload: true });
    try {
      await gameAPI.skipWord(state.gameId, {
        wordId: state.currentWord.wordId,
        difficultyRating: rating,
      });
      dispatch({ type: 'NEXT_WORD' });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to skip word',
      });
    }
  }, [state.gameId, state.currentWord]);

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
        loadCategoriesAsync,
        fetchNextWordAsync,
        prefetchNextWordAsync,
        rateWordAsync,
        skipWordAsync,
        endGameAsync,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
