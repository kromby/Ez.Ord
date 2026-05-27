import React from 'react';
import renderer, { act } from 'react-test-renderer';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({ intent: 'rate' }),
}));

jest.mock('@/hooks/useGameState');
const { useGameState } = require('@/hooks/useGameState');

const BASE_STATE = {
  gameId: null,
  currentWord: null,
  isLoading: false,
  error: null,
  game: null,
  wordIndex: 0,
  playedWords: [],
  availableCategories: [],
  selectedCategories: {},
  nextWord: null,
  currentRating: null,
  currentSkipped: false,
  route: 'review' as const,
};

describe('ReviewScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to / when there is no active game (gameId is null)', async () => {
    useGameState.mockReturnValue({
      state: { ...BASE_STATE, gameId: null },
      rateWordAsync: jest.fn(),
      skipWordAsync: jest.fn(),
      endGameAsync: jest.fn(),
      prefetchNextWordAsync: jest.fn(),
    });

    await act(async () => {
      renderer.create(
        React.createElement(require('../../app/games/review').default)
      );
    });

    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  it('does not redirect when there is an active game', async () => {
    useGameState.mockReturnValue({
      state: { ...BASE_STATE, gameId: 'game-abc' },
      rateWordAsync: jest.fn(),
      skipWordAsync: jest.fn(),
      endGameAsync: jest.fn(),
      prefetchNextWordAsync: jest.fn(),
    });

    await act(async () => {
      renderer.create(
        React.createElement(require('../../app/games/review').default)
      );
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });
});
