import React from 'react';
import renderer, { act } from 'react-test-renderer';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), back: jest.fn() }),
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
  route: 'game' as const,
};

describe('PlayScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to / when there is no active game (gameId is null)', async () => {
    useGameState.mockReturnValue({
      state: { ...BASE_STATE, gameId: null },
      fetchNextWordAsync: jest.fn(),
    });

    await act(async () => {
      renderer.create(
        React.createElement(require('../../app/games/play').default)
      );
    });

    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  it('does not redirect when there is an active game', async () => {
    useGameState.mockReturnValue({
      state: { ...BASE_STATE, gameId: 'game-abc', isLoading: true },
      fetchNextWordAsync: jest.fn(),
    });

    await act(async () => {
      renderer.create(
        React.createElement(require('../../app/games/play').default)
      );
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });
});
