import type { GameSetupParams, RatingPayload, SkipPayload, Game, Word, GameSummary } from '../../app/types/game';

jest.mock('axios');

describe('GameAPI', () => {
  const mockGame: Game = {
    gameId: 'game123',
    gameType: 'drawing',
    categories: ['nafn', 'sagn'],
    startedAt: new Date().toISOString(),
  };

  const mockWord: Word = {
    word: 'hestur',
    category: 'nafn',
    wordId: 'word1',
  };

  const mockGameSummary: GameSummary = {
    gameId: 'game123',
    gameType: 'drawing',
    categories: ['nafn'],
    startedAt: new Date().toISOString(),
    words: [
      {
        sequence: 1,
        word: 'hestur',
        category: 'nafn',
        drawnAt: new Date().toISOString(),
        rating: 'easy',
        skipped: false,
      },
    ],
  };

  let mockClient: any;

  beforeEach(() => {
    // resetModules ensures each test loads a fresh API singleton so the
    // newly-created mockClient is the one axios.create returns to the service.
    jest.resetModules();
    const axios = require('axios');
    mockClient = {
      post: jest.fn(),
      get: jest.fn(),
    };
    axios.create.mockReturnValue(mockClient);
  });

  describe('startGame', () => {
    it('should successfully start a game', async () => {
      const params: GameSetupParams = {
        gameType: 'drawing',
        categories: ['nafn'],
      };

      mockClient.post.mockResolvedValue({
        data: {
          success: true,
          data: mockGame,
        },
      });

      const gameAPI = require('../../app/services/api').default;
      const result = await gameAPI.startGame(params);

      expect(result).toEqual(mockGame);
      expect(mockClient.post).toHaveBeenCalledWith('/api/games/start', expect.any(Object));
    });

    it('should throw error if game start fails', async () => {
      const params: GameSetupParams = {
        gameType: 'drawing',
        categories: ['nafn'],
      };

      mockClient.post.mockResolvedValue({
        data: {
          success: false,
          message: 'Failed to start game',
        },
      });

      const gameAPI = require('../../app/services/api').default;

      await expect(gameAPI.startGame(params)).rejects.toThrow('Failed to start game');
    });
  });

  describe('getNextWord', () => {
    it('should successfully get next word', async () => {
      mockClient.get.mockResolvedValue({
        data: {
          success: true,
          data: mockWord,
        },
      });

      const gameAPI = require('../../app/services/api').default;
      const result = await gameAPI.getNextWord('game123');

      expect(result).toEqual(mockWord);
      expect(mockClient.get).toHaveBeenCalledWith('/api/games/game123/next-word');
    });

    it('should throw error if getting word fails', async () => {
      mockClient.get.mockResolvedValue({
        data: {
          success: false,
          message: 'Failed to get word',
        },
      });

      const gameAPI = require('../../app/services/api').default;

      await expect(gameAPI.getNextWord('game123')).rejects.toThrow('Failed to get word');
    });
  });

  describe('rateWord', () => {
    it('should successfully rate a word', async () => {
      const payload: RatingPayload = {
        wordId: 'word1',
        difficultyRating: 'easy',
      };

      mockClient.post.mockResolvedValue({
        data: {
          success: true,
        },
      });

      const gameAPI = require('../../app/services/api').default;
      await expect(gameAPI.rateWord('game123', payload)).resolves.toBeUndefined();
      expect(mockClient.post).toHaveBeenCalledWith('/api/games/game123/rate-word', expect.any(Object));
    });

    it('should throw error if rating fails', async () => {
      const payload: RatingPayload = {
        wordId: 'word1',
        difficultyRating: 'hard',
      };

      mockClient.post.mockResolvedValue({
        data: {
          success: false,
          message: 'Failed to rate word',
        },
      });

      const gameAPI = require('../../app/services/api').default;

      await expect(gameAPI.rateWord('game123', payload)).rejects.toThrow('Failed to rate word');
    });
  });

  describe('skipWord', () => {
    it('should successfully skip a word', async () => {
      const payload: SkipPayload = {
        wordId: 'word1',
        difficultyRating: 'easy',
      };

      mockClient.post.mockResolvedValue({
        data: {
          success: true,
        },
      });

      const gameAPI = require('../../app/services/api').default;
      await expect(gameAPI.skipWord('game123', payload)).resolves.toBeUndefined();
      expect(mockClient.post).toHaveBeenCalledWith('/api/games/game123/skip-word', expect.any(Object));
    });

    it('should throw error if skipping fails', async () => {
      const payload: SkipPayload = {
        wordId: 'word1',
        difficultyRating: 'easy',
      };

      mockClient.post.mockResolvedValue({
        data: {
          success: false,
          message: 'Failed to skip word',
        },
      });

      const gameAPI = require('../../app/services/api').default;

      await expect(gameAPI.skipWord('game123', payload)).rejects.toThrow('Failed to skip word');
    });
  });

  describe('endGame', () => {
    it('should successfully end a game', async () => {
      mockClient.post.mockResolvedValue({
        data: {
          success: true,
        },
      });

      const gameAPI = require('../../app/services/api').default;
      await expect(gameAPI.endGame('game123')).resolves.toBeUndefined();
      expect(mockClient.post).toHaveBeenCalledWith('/api/games/game123/end');
    });

    it('should throw error if ending game fails', async () => {
      mockClient.post.mockResolvedValue({
        data: {
          success: false,
          message: 'Failed to end game',
        },
      });

      const gameAPI = require('../../app/services/api').default;

      await expect(gameAPI.endGame('game123')).rejects.toThrow('Failed to end game');
    });
  });

  describe('getGameSummary', () => {
    it('should successfully get game summary', async () => {
      mockClient.get.mockResolvedValue({
        data: {
          success: true,
          data: mockGameSummary,
        },
      });

      const gameAPI = require('../../app/services/api').default;
      const result = await gameAPI.getGameSummary('game123');

      expect(result).toEqual(mockGameSummary);
      expect(mockClient.get).toHaveBeenCalledWith('/api/games/game123');
    });

    it('should throw error if getting summary fails', async () => {
      mockClient.get.mockResolvedValue({
        data: {
          success: false,
          message: 'Failed to get game summary',
        },
      });

      const gameAPI = require('../../app/services/api').default;

      await expect(gameAPI.getGameSummary('game123')).rejects.toThrow('Failed to get game summary');
    });
  });

  describe('getCategories', () => {
    it('should successfully get categories', async () => {
      const mockCategories = [
        { id: 'nafn', name: 'nafn' },
        { id: 'sagn', name: 'sagn' },
      ];

      mockClient.get.mockResolvedValue({
        data: {
          success: true,
          data: { categories: mockCategories },
        },
      });

      const gameAPI = require('../../app/services/api').default;
      const result = await gameAPI.getCategories();

      expect(result).toEqual(mockCategories);
      expect(mockClient.get).toHaveBeenCalledWith('/api/categories');
    });

    it('should throw error if getting categories fails', async () => {
      mockClient.get.mockResolvedValue({
        data: {
          success: false,
          message: 'Failed to get categories',
        },
      });

      const gameAPI = require('../../app/services/api').default;

      await expect(gameAPI.getCategories()).rejects.toThrow('Failed to get categories');
    });
  });
});
