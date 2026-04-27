using EzOrd.Models;
using System.Text.Json;

namespace EzOrd.Services
{
    public class GameService
    {
        private readonly StorageService _storage;

        public GameService(StorageService storage)
        {
            _storage = storage;
        }

        // Create a new game session
        public async Task<GameStartResponse> StartGameAsync(GameStartRequest request)
        {
            var gameId = Guid.NewGuid().ToString();
            var now = DateTime.UtcNow;

            var game = new GameEntity
            {
                RowKey = gameId,
                GameType = request.GameType,
                Categories = JsonSerializer.Serialize(request.Categories),
                StartedAt = now,
                UserId = null
            };

            await _storage.InsertGameAsync(game);

            return new GameStartResponse
            {
                GameId = gameId,
                GameType = request.GameType,
                Categories = request.Categories,
                StartedAt = now
            };
        }

        // Get next random word for a game
        public async Task<WordResponse> GetNextWordAsync(string gameId)
        {
            var game = await _storage.GetGameAsync(gameId);
            if (game == null)
                throw new InvalidOperationException("Game not found");

            if (game.EndedAt.HasValue)
                throw new InvalidOperationException("Game has already ended");

            var categories = JsonSerializer.Deserialize<List<string>>(game.Categories) ?? new();
            var words = await _storage.GetWordsByCategoriesAsync(categories);

            if (words.Count == 0)
                throw new InvalidOperationException("No words available in selected categories");

            // Random selection
            var random = new Random();
            var selectedWord = words[random.Next(words.Count)];

            // Create GameWord entry
            var sequence = await _storage.GetGameWordCountAsync(gameId);
            var gameWord = new GameWordEntity
            {
                PartitionKey = gameId,
                RowKey = sequence.ToString(),
                WordId = selectedWord.RowKey,
                Word = selectedWord.Word,
                Category = selectedWord.Category,
                DrawnAt = DateTime.UtcNow
            };

            await _storage.InsertGameWordAsync(gameWord);

            // Increment usage count
            await _storage.UpdateWordUsageAsync(selectedWord);

            return new WordResponse
            {
                Word = selectedWord.Word,
                Category = selectedWord.Category,
                WordId = selectedWord.RowKey
            };
        }

        // Rate a word
        public async Task RateWordAsync(string gameId, RateWordRequest request)
        {
            var game = await _storage.GetGameAsync(gameId);
            if (game == null)
                throw new InvalidOperationException("Game not found");

            var rating = new WordRatingEntity
            {
                PartitionKey = request.WordId,
                RowKey = gameId,
                Difficulty = request.DifficultyRating,
                GameType = game.GameType,
                RatedAt = DateTime.UtcNow
            };

            await _storage.InsertRatingAsync(rating);
        }

        // Skip a word
        public async Task SkipWordAsync(string gameId, SkipWordRequest request)
        {
            var game = await _storage.GetGameAsync(gameId);
            if (game == null)
                throw new InvalidOperationException("Game not found");

            var rating = new WordRatingEntity
            {
                PartitionKey = request.WordId,
                RowKey = gameId,
                Difficulty = "skipped",
                GameType = game.GameType,
                RatedAt = DateTime.UtcNow
            };

            await _storage.InsertRatingAsync(rating);
        }

        // End a game
        public async Task<GameEndResponse> EndGameAsync(string gameId)
        {
            var game = await _storage.GetGameAsync(gameId);
            if (game == null)
                throw new InvalidOperationException("Game not found");

            game.EndedAt = DateTime.UtcNow;
            await _storage.UpdateGameAsync(game);

            var wordCount = await _storage.GetGameWordCountAsync(gameId);

            return new GameEndResponse
            {
                GameId = gameId,
                EndedAt = game.EndedAt.Value,
                WordCount = wordCount
            };
        }

        // Get game details
        public async Task<GameDetailsResponse> GetGameDetailsAsync(string gameId)
        {
            var game = await _storage.GetGameAsync(gameId);
            if (game == null)
                throw new InvalidOperationException("Game not found");

            var gameWords = await _storage.GetGameWordsAsync(gameId);
            var categories = JsonSerializer.Deserialize<List<string>>(game.Categories) ?? new();

            var wordDetails = new List<GameWordDetailsDto>();
            foreach (var gw in gameWords)
            {
                var rating = await _storage.GetRatingAsync(gw.WordId, gameId);
                wordDetails.Add(new GameWordDetailsDto
                {
                    Sequence = int.Parse(gw.RowKey),
                    Word = gw.Word,
                    Category = gw.Category,
                    DrawnAt = gw.DrawnAt,
                    Rating = rating?.Difficulty
                });
            }

            return new GameDetailsResponse
            {
                GameId = gameId,
                GameType = game.GameType,
                Categories = categories,
                StartedAt = game.StartedAt,
                EndedAt = game.EndedAt,
                Words = wordDetails
            };
        }
    }
}
