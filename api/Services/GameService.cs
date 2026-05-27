using EzOrd.Models;
using System.Text.Json;

namespace EzOrd.Services
{
    public class GameService
    {
        private readonly IStorageService _storage;

        public GameService(IStorageService storage)
        {
            _storage = storage;
        }

        // Create a new game session
        public async Task<GameStartResponse> StartGameAsync(GameStartRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.GameType))
                throw new ArgumentException("GameType is required.", nameof(request));

            var gameTypeLookup = await _storage.GetLookupAsync("gameType", request.GameType);
            if (gameTypeLookup == null || !gameTypeLookup.Enabled)
                throw new InvalidOperationException("Unknown game type");

            if (request.Categories is null || request.Categories.Count == 0)
                throw new ArgumentException("At least one category is required.", nameof(request));

            var enabledRows = await _storage.GetEnabledCategoriesAsync();
            var requested = new HashSet<string>(request.Categories, StringComparer.OrdinalIgnoreCase);
            var wordClasses = enabledRows
                .Where(r => requested.Contains(r.PartitionKey))
                .Select(r => r.RowKey)
                .Distinct()
                .ToList();

            if (wordClasses.Count == 0)
                throw new InvalidOperationException("None of the selected categories are available.");

            var gameId = Guid.NewGuid().ToString();
            var now = DateTime.UtcNow;

            var game = new GameEntity
            {
                RowKey = gameId,
                GameType = request.GameType,
                Categories = JsonSerializer.Serialize(request.Categories),
                WordClasses = JsonSerializer.Serialize(wordClasses),
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

            var wordClasses = !string.IsNullOrEmpty(game.WordClasses)
                ? JsonSerializer.Deserialize<List<string>>(game.WordClasses) ?? new()
                : new();

            var selectedWord = await _storage.GetRandomWordAsync(wordClasses);
            if (selectedWord == null)
                throw new InvalidOperationException("No words available in selected categories");

            // Resolve category display name and type name
            var categoryName = await _storage.GetCategoryNameByWordClassAsync(selectedWord.PartitionKey);
            var wordType = await _storage.GetWordTypeAsync(selectedWord.PartitionKey, selectedWord.Category);

            // Create GameWord entry
            var sequence = await _storage.GetGameWordCountAsync(gameId);
            var gameWord = new GameWordEntity
            {
                PartitionKey = gameId,
                RowKey = Guid.NewGuid().ToString(),
                Sequence = sequence,
                WordId = selectedWord.RowKey,
                Word = selectedWord.Word,
                Category = categoryName ?? selectedWord.PartitionKey,
                DrawnAt = DateTime.UtcNow
            };

            await _storage.InsertGameWordAsync(gameWord);

            // Increment usage count
            await _storage.UpdateWordUsageAsync(selectedWord);

            return new WordResponse
            {
                Word = selectedWord.Word,
                Category = categoryName ?? selectedWord.PartitionKey,
                TypeName = wordType?.Name ?? string.Empty,
                WordId = selectedWord.RowKey
            };
        }

        // Rate a word
        public async Task RateWordAsync(string gameId, RateWordRequest request)
        {
            var game = await _storage.GetGameAsync(gameId);
            if (game == null)
                throw new InvalidOperationException("Game not found");
            if (game.EndedAt.HasValue)
                throw new InvalidOperationException("Game has already ended");

            ValidateDifficulty(request.DifficultyRating);

            var rating = new WordRatingEntity
            {
                PartitionKey = request.WordId,
                RowKey = gameId,
                Difficulty = request.DifficultyRating,
                Skipped = false,
                GameType = game.GameType,
                RatedAt = DateTime.UtcNow
            };

            await _storage.InsertRatingAsync(rating);
        }

        // Skip a word — difficulty is still required so we can capture why it was skipped
        public async Task SkipWordAsync(string gameId, SkipWordRequest request)
        {
            var game = await _storage.GetGameAsync(gameId);
            if (game == null)
                throw new InvalidOperationException("Game not found");
            if (game.EndedAt.HasValue)
                throw new InvalidOperationException("Game has already ended");

            ValidateDifficulty(request.DifficultyRating);

            var rating = new WordRatingEntity
            {
                PartitionKey = request.WordId,
                RowKey = gameId,
                Difficulty = request.DifficultyRating,
                Skipped = true,
                GameType = game.GameType,
                RatedAt = DateTime.UtcNow
            };

            await _storage.InsertRatingAsync(rating);
        }

        private static void ValidateDifficulty(string difficulty)
        {
            if (difficulty != "easy" && difficulty != "medium" && difficulty != "hard")
                throw new InvalidOperationException("Difficulty must be one of: easy, medium, hard.");
        }

        // End a game
        public async Task<GameEndResponse> EndGameAsync(string gameId)
        {
            var game = await _storage.GetGameAsync(gameId);
            if (game == null)
                throw new InvalidOperationException("Game not found");

            if (!game.EndedAt.HasValue)
            {
                game.EndedAt = DateTime.UtcNow;
                await _storage.UpdateGameAsync(game);
            }

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
                    Sequence = gw.Sequence,
                    Word = gw.Word,
                    Category = gw.Category,
                    DrawnAt = gw.DrawnAt,
                    Rating = rating?.Difficulty,
                    Skipped = rating?.Skipped ?? false
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
