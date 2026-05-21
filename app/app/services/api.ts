import axios, { AxiosInstance } from 'axios';
import type { AxiosError } from 'axios';
import {
  Game,
  Word,
  Category,
  GameSetupParams,
  RatingPayload,
  SkipPayload,
  GameSummary,
  ApiResponse
} from '../types/game';

class GameAPI {
  private client: AxiosInstance;

  private extractErrorMessage(error: unknown, fallback: string): string {
    if (axios.isAxiosError(error)) {
      const apiMessage = (error as AxiosError<ApiResponse<unknown>>).response?.data?.message;
      return apiMessage || (error as AxiosError).message || fallback;
    }
    return fallback;
  }

  constructor(baseURL: string = process.env.EXPO_PUBLIC_API_BASE_URL || '') {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Start a new game
  async startGame(params: GameSetupParams): Promise<Game> {
    try {
      const response = await this.client.post<ApiResponse<Game>>('/api/games/start', {
        gameType: params.gameType,
        categories: params.categories,
      });
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to start game');
      }
      return response.data.data;
    } catch (error) {
      throw new Error(this.extractErrorMessage(error, 'Failed to start game'));
    }
  }

  // Get next word
  async getNextWord(gameId: string): Promise<Word> {
    try {
      const response = await this.client.get<ApiResponse<Word>>(`/api/games/${gameId}/next-word`);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to get word');
      }
      return response.data.data;
    } catch (error) {
      throw new Error(this.extractErrorMessage(error, 'Failed to get word'));
    }
  }

  // Rate a word
  async rateWord(gameId: string, payload: RatingPayload): Promise<void> {
    try {
      const response = await this.client.post<ApiResponse<void>>(`/api/games/${gameId}/rate-word`, {
        wordId: payload.wordId,
        difficultyRating: payload.difficultyRating,
      });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to rate word');
      }
    } catch (error) {
      throw new Error(this.extractErrorMessage(error, 'Failed to rate word'));
    }
  }

  // Skip a word
  async skipWord(gameId: string, payload: SkipPayload): Promise<void> {
    try {
      const response = await this.client.post<ApiResponse<void>>(`/api/games/${gameId}/skip-word`, {
        wordId: payload.wordId,
        difficultyRating: payload.difficultyRating,
      });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to skip word');
      }
    } catch (error) {
      throw new Error(this.extractErrorMessage(error, 'Failed to skip word'));
    }
  }

  // End a game
  async endGame(gameId: string): Promise<void> {
    try {
      const response = await this.client.post<ApiResponse<void>>(`/api/games/${gameId}/end`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to end game');
      }
    } catch (error) {
      throw new Error(this.extractErrorMessage(error, 'Failed to end game'));
    }
  }

  // Get game summary
  async getGameSummary(gameId: string): Promise<GameSummary> {
    try {
      const response = await this.client.get<ApiResponse<GameSummary>>(`/api/games/${gameId}`);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to get game summary');
      }
      return response.data.data;
    } catch (error) {
      throw new Error(this.extractErrorMessage(error, 'Failed to get game summary'));
    }
  }

  // Get categories
  async getCategories(): Promise<Category[]> {
    try {
      const response = await this.client.get<ApiResponse<{ categories: Category[] }>>('/api/categories');
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to get categories');
      }
      return response.data.data.categories;
    } catch (error) {
      throw new Error(this.extractErrorMessage(error, 'Failed to get categories'));
    }
  }
}

export const gameAPI = new GameAPI();
export default gameAPI;
