using Xunit;
using Moq;
using EzOrd.Models;
using EzOrd.Services;
using System.Text.Json;

namespace EzOrd.Tests
{
    public class GameServiceTests
    {
        private readonly Mock<IStorageService> _mockStorageService;
        private readonly GameService _gameService;

        public GameServiceTests()
        {
            _mockStorageService = new Mock<IStorageService>();
            _gameService = new GameService(_mockStorageService.Object);
        }

        [Fact]
        public async Task StartGameAsync_ShouldCreateGameAndReturnGameId()
        {
            // Arrange
            var request = new GameStartRequest
            {
                GameType = "drawing",
                Categories = new List<string> { "nafn", "sagn" }
            };

            // Act
            var result = await _gameService.StartGameAsync(request);

            // Assert
            Assert.NotNull(result);
            Assert.NotEmpty(result.GameId);
            Assert.Equal(request.GameType, result.GameType);
            Assert.Equal(request.Categories, result.Categories);
            Assert.True(result.StartedAt <= DateTime.UtcNow);
        }

        [Fact]
        public async Task StartGameAsync_ShouldCallInsertGameAsync()
        {
            // Arrange
            var request = new GameStartRequest
            {
                GameType = "drawing",
                Categories = new List<string> { "nafn" }
            };

            // Act
            await _gameService.StartGameAsync(request);

            // Assert
            _mockStorageService.Verify(
                s => s.InsertGameAsync(It.IsAny<GameEntity>()),
                Times.Once);
        }

        [Fact]
        public async Task GetNextWordAsync_ShouldThrowWhenGameNotFound()
        {
            // Arrange
            var gameId = "nonexistent";
            _mockStorageService
                .Setup(s => s.GetGameAsync(gameId))
                .ReturnsAsync((GameEntity?)null);

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(
                () => _gameService.GetNextWordAsync(gameId));
        }

        [Fact]
        public async Task GetNextWordAsync_ShouldThrowWhenGameEnded()
        {
            // Arrange
            var gameId = "game123";
            var endedGame = new GameEntity
            {
                PartitionKey = "game_drawing",
                RowKey = gameId,
                GameType = "drawing",
                Categories = "[]",
                StartedAt = DateTime.UtcNow,
                EndedAt = DateTime.UtcNow.AddHours(-1)
            };

            _mockStorageService
                .Setup(s => s.GetGameAsync(gameId))
                .ReturnsAsync(endedGame);

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(
                () => _gameService.GetNextWordAsync(gameId));
        }

        [Fact]
        public async Task GetNextWordAsync_ShouldReturnWordFromSelectedCategories()
        {
            // Arrange
            var gameId = "game123";
            var game = new GameEntity
            {
                PartitionKey = "game_drawing",
                RowKey = gameId,
                GameType = "drawing",
                Categories = JsonSerializer.Serialize(new[] { "nafn" }),
                StartedAt = DateTime.UtcNow
            };

            var word = new WordEntity
            {
                PartitionKey = "nafn",
                RowKey = "word1",
                Word = "hestur",
                Category = "nafn",
                UsageCount = 5
            };

            _mockStorageService
                .Setup(s => s.GetGameAsync(gameId))
                .ReturnsAsync(game);
            _mockStorageService
                .Setup(s => s.GetWordsByCategoriesAsync(It.IsAny<List<string>>()))
                .ReturnsAsync(new List<WordEntity> { word });
            _mockStorageService
                .Setup(s => s.GetGameWordCountAsync(gameId))
                .ReturnsAsync(0);

            // Act
            var result = await _gameService.GetNextWordAsync(gameId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("hestur", result.Word);
            Assert.Equal("nafn", result.Category);
            Assert.Equal("word1", result.WordId);
        }

        [Fact]
        public async Task GetNextWordAsync_ShouldThrowWhenNoWordsAvailable()
        {
            // Arrange
            var gameId = "game123";
            var game = new GameEntity
            {
                PartitionKey = "game_drawing",
                RowKey = gameId,
                GameType = "drawing",
                Categories = JsonSerializer.Serialize(new[] { "nafn" }),
                StartedAt = DateTime.UtcNow
            };

            _mockStorageService
                .Setup(s => s.GetGameAsync(gameId))
                .ReturnsAsync(game);
            _mockStorageService
                .Setup(s => s.GetWordsByCategoriesAsync(It.IsAny<List<string>>()))
                .ReturnsAsync(new List<WordEntity>());

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(
                () => _gameService.GetNextWordAsync(gameId));
        }

        [Fact]
        public async Task RateWordAsync_ShouldInsertRating()
        {
            // Arrange
            var gameId = "game123";
            var wordId = "word1";
            var game = new GameEntity
            {
                PartitionKey = "game_drawing",
                RowKey = gameId,
                GameType = "drawing",
                Categories = "[]",
                StartedAt = DateTime.UtcNow
            };

            var request = new RateWordRequest
            {
                WordId = wordId,
                DifficultyRating = "hard"
            };

            _mockStorageService
                .Setup(s => s.GetGameAsync(gameId))
                .ReturnsAsync(game);

            // Act
            await _gameService.RateWordAsync(gameId, request);

            // Assert
            _mockStorageService.Verify(
                s => s.InsertRatingAsync(It.Is<WordRatingEntity>(
                    r => r.Difficulty == "hard" && r.PartitionKey == wordId)),
                Times.Once);
        }

        [Fact]
        public async Task RateWordAsync_ShouldThrowWhenGameNotFound()
        {
            // Arrange
            var gameId = "nonexistent";
            var request = new RateWordRequest { WordId = "word1", DifficultyRating = "easy" };

            _mockStorageService
                .Setup(s => s.GetGameAsync(gameId))
                .ReturnsAsync((GameEntity?)null);

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(
                () => _gameService.RateWordAsync(gameId, request));
        }

        [Fact]
        public async Task SkipWordAsync_ShouldInsertSkipAsRating()
        {
            // Arrange
            var gameId = "game123";
            var wordId = "word1";
            var game = new GameEntity
            {
                PartitionKey = "game_drawing",
                RowKey = gameId,
                GameType = "drawing",
                Categories = "[]",
                StartedAt = DateTime.UtcNow
            };

            var request = new SkipWordRequest { WordId = wordId };

            _mockStorageService
                .Setup(s => s.GetGameAsync(gameId))
                .ReturnsAsync(game);

            // Act
            await _gameService.SkipWordAsync(gameId, request);

            // Assert
            _mockStorageService.Verify(
                s => s.InsertRatingAsync(It.Is<WordRatingEntity>(
                    r => r.Difficulty == "skipped" && r.PartitionKey == wordId)),
                Times.Once);
        }

        [Fact]
        public async Task EndGameAsync_ShouldMarkGameAsEnded()
        {
            // Arrange
            var gameId = "game123";
            var game = new GameEntity
            {
                PartitionKey = "game_drawing",
                RowKey = gameId,
                GameType = "drawing",
                Categories = "[]",
                StartedAt = DateTime.UtcNow
            };

            _mockStorageService
                .Setup(s => s.GetGameAsync(gameId))
                .ReturnsAsync(game);
            _mockStorageService
                .Setup(s => s.GetGameWordCountAsync(gameId))
                .ReturnsAsync(5);

            // Act
            var result = await _gameService.EndGameAsync(gameId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(gameId, result.GameId);
            Assert.Equal(5, result.WordCount);
            Assert.True(result.EndedAt <= DateTime.UtcNow);
        }

        [Fact]
        public async Task EndGameAsync_ShouldCallUpdateGameAsync()
        {
            // Arrange
            var gameId = "game123";
            var game = new GameEntity
            {
                PartitionKey = "game_drawing",
                RowKey = gameId,
                GameType = "drawing",
                Categories = "[]",
                StartedAt = DateTime.UtcNow
            };

            _mockStorageService
                .Setup(s => s.GetGameAsync(gameId))
                .ReturnsAsync(game);
            _mockStorageService
                .Setup(s => s.GetGameWordCountAsync(gameId))
                .ReturnsAsync(0);

            // Act
            await _gameService.EndGameAsync(gameId);

            // Assert
            _mockStorageService.Verify(
                s => s.UpdateGameAsync(It.Is<GameEntity>(g => g.EndedAt.HasValue)),
                Times.Once);
        }

        [Fact]
        public async Task GetGameDetailsAsync_ShouldReturnCompleteGameDetails()
        {
            // Arrange
            var gameId = "game123";
            var game = new GameEntity
            {
                PartitionKey = "game_drawing",
                RowKey = gameId,
                GameType = "drawing",
                Categories = JsonSerializer.Serialize(new[] { "nafn", "sagn" }),
                StartedAt = DateTime.UtcNow
            };

            var gameWords = new List<GameWordEntity>
            {
                new GameWordEntity
                {
                    PartitionKey = gameId,
                    RowKey = "0",
                    WordId = "word1",
                    Word = "hestur",
                    Category = "nafn",
                    DrawnAt = DateTime.UtcNow
                }
            };

            var rating = new WordRatingEntity
            {
                PartitionKey = "word1",
                RowKey = gameId,
                Difficulty = "easy"
            };

            _mockStorageService
                .Setup(s => s.GetGameAsync(gameId))
                .ReturnsAsync(game);
            _mockStorageService
                .Setup(s => s.GetGameWordsAsync(gameId))
                .ReturnsAsync(gameWords);
            _mockStorageService
                .Setup(s => s.GetRatingAsync("word1", gameId))
                .ReturnsAsync(rating);

            // Act
            var result = await _gameService.GetGameDetailsAsync(gameId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(gameId, result.GameId);
            Assert.Equal("drawing", result.GameType);
            Assert.Single(result.Words);
            Assert.Equal("hestur", result.Words[0].Word);
            Assert.Equal("easy", result.Words[0].Rating);
        }
    }
}
