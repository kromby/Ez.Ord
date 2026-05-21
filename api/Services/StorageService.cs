using Azure;
using Azure.Data.Tables;
using EzOrd.Models;

namespace EzOrd.Services
{
    public class StorageService : IStorageService
    {
        private readonly TableServiceClient _tableServiceClient;
        private TableClient _gamesTable = null!;
        private TableClient _gameWordsTable = null!;
        private TableClient _wordRatingsTable = null!;
        private TableClient _wordsTable = null!;
        private TableClient _categoriesTable = null!;

        public StorageService(TableServiceClient tableServiceClient)
        {
            _tableServiceClient = tableServiceClient;
        }

        public async Task InitializeAsync()
        {
            _gamesTable = _tableServiceClient.GetTableClient("Games");
            _gameWordsTable = _tableServiceClient.GetTableClient("GameWords");
            _wordRatingsTable = _tableServiceClient.GetTableClient("WordRatings");
            _wordsTable = _tableServiceClient.GetTableClient("Words");
            _categoriesTable = _tableServiceClient.GetTableClient("Categories");

            await _gamesTable.CreateIfNotExistsAsync();
            await _gameWordsTable.CreateIfNotExistsAsync();
            await _wordRatingsTable.CreateIfNotExistsAsync();
            await _wordsTable.CreateIfNotExistsAsync();
            await _categoriesTable.CreateIfNotExistsAsync();
        }

        // Games
        public async Task<GameEntity?> GetGameAsync(string gameId)
        {
            try
            {
                return await _gamesTable.GetEntityAsync<GameEntity>("games", gameId);
            }
            catch (RequestFailedException ex) when (ex.Status == 404)
            {
                return null;
            }
        }

        public async Task InsertGameAsync(GameEntity game)
        {
            game.PartitionKey = "games";
            game.RowKey = game.RowKey; // Game ID already set
            await _gamesTable.AddEntityAsync(game);
        }

        public async Task UpdateGameAsync(GameEntity game)
        {
            await _gamesTable.UpdateEntityAsync(game, game.ETag);
        }

        // GameWords
        public async Task InsertGameWordAsync(GameWordEntity gameWord)
        {
            await _gameWordsTable.AddEntityAsync(gameWord);
        }

        public async Task<List<GameWordEntity>> GetGameWordsAsync(string gameId)
        {
            var query = _gameWordsTable.QueryAsync<GameWordEntity>(w => w.PartitionKey == gameId);
            var results = new List<GameWordEntity>();
            await foreach (var item in query)
            {
                results.Add(item);
            }
            return results.OrderBy(w => w.Sequence).ToList();
        }

        public async Task<int> GetGameWordCountAsync(string gameId)
        {
            var words = await GetGameWordsAsync(gameId);
            return words.Count;
        }

        // WordRatings
        public async Task InsertRatingAsync(WordRatingEntity rating)
        {
            await _wordRatingsTable.AddEntityAsync(rating);
        }

        public async Task<WordRatingEntity?> GetRatingAsync(string wordId, string gameId)
        {
            try
            {
                return await _wordRatingsTable.GetEntityAsync<WordRatingEntity>(wordId, gameId);
            }
            catch (RequestFailedException ex) when (ex.Status == 404)
            {
                return null;
            }
        }

        // Words
        public async Task<WordEntity?> GetWordAsync(string wordId, string category)
        {
            try
            {
                return await _wordsTable.GetEntityAsync<WordEntity>(category, wordId);
            }
            catch (RequestFailedException ex) when (ex.Status == 404)
            {
                return null;
            }
        }

        public async Task<List<WordEntity>> GetWordsByCategoriesAsync(List<string> wordClasses)
        {
            var results = new List<WordEntity>();
            foreach (var wordClass in wordClasses)
            {
                var query = _wordsTable.QueryAsync<WordEntity>(w => w.PartitionKey == wordClass);
                await foreach (var item in query)
                {
                    results.Add(item);
                }
            }
            return results;
        }

        public async Task UpdateWordUsageAsync(WordEntity word)
        {
            word.UsageCount++;
            await _wordsTable.UpdateEntityAsync(word, word.ETag);
        }

        public async Task<List<CategoryEntity>> GetEnabledCategoriesAsync()
        {
            var query = _categoriesTable.QueryAsync<CategoryEntity>(c => c.Enabled);
            var results = new List<CategoryEntity>();
            await foreach (var item in query)
            {
                results.Add(item);
            }
            return results;
        }
    }
}
