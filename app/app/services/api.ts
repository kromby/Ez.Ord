import axios, { AxiosInstance } from 'axios';
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

  constructor(baseURL: string = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5001') {
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
    const response = await this.client.post<ApiResponse<Game>>('/api/games/start', {
      gameType: params.gameType,
      categories: params.categories,
    });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to start game');
    }
    return response.data.data;
  }

  // Get next word
  async getNextWord(gameId: string): Promise<Word> {
    const response = await this.client.get<ApiResponse<Word>>(`/api/games/${gameId}/next-word`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to get word');
    }
    return response.data.data;
  }

  // Rate a word
  async rateWord(gameId: string, payload: RatingPayload): Promise<void> {
    const response = await this.client.post<ApiResponse<void>>(`/api/games/${gameId}/rate-word`, {
      wordId: payload.wordId,
      difficultyRating: payload.difficultyRating,
    });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to rate word');
    }
  }

  // Skip a word
  async skipWord(gameId: string, payload: SkipPayload): Promise<void> {
    const response = await this.client.post<ApiResponse<void>>(`/api/games/${gameId}/skip-word`, {
      wordId: payload.wordId,
    });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to skip word');
    }
  }

  // End a game
  async endGame(gameId: string): Promise<void> {
    const response = await this.client.post<ApiResponse<void>>(`/api/games/${gameId}/end`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to end game');
    }
  }

  // Get game summary
  async getGameSummary(gameId: string): Promise<GameSummary> {
    const response = await this.client.get<ApiResponse<GameSummary>>(`/api/games/${gameId}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to get game summary');
    }
    return response.data.data;
  }

  // Get categories
  async getCategories(): Promise<Category[]> {
    const response = await this.client.get<ApiResponse<{ categories: Category[] }>>('/api/categories');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to get categories');
    }
    return response.data.data.categories;
  }
}

export const gameAPI = new GameAPI();
export default gameAPI;
