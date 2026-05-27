using Azure;
using Azure.Data.Tables;
using EzOrd.Models;
using System.Collections.Concurrent;

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
        private TableClient _wordTypesTable = null!;
        private TableClient _lookupsTable = null!;
        private TableClient _wordDifficultiesTable = null!;

        private readonly ConcurrentDictionary<string, Lazy<Task<List<string>>>> _wordIdsByClass = new();

        private static readonly IReadOnlyDictionary<string, string> KnownTypeNames = new Dictionary<string, string>
        {
            ["alm"] = "Almennt orð",
            ["ism"] = "Eiginnafn",
            ["föð"] = "Föðurnafn",
            ["móð"] = "Móðurnafn",
            ["örn"] = "Örnefni",
            ["tölv"] = "Tölvumál",
            ["tung"] = "Tungumál",
            ["íþr"] = "Íþróttamál",
            ["fjár"] = "Fjármál"
        };

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
            _wordTypesTable = _tableServiceClient.GetTableClient("WordTypes");
            _lookupsTable = _tableServiceClient.GetTableClient("Lookups");
            _wordDifficultiesTable = _tableServiceClient.GetTableClient("WordDifficulties");

            await _gamesTable.CreateIfNotExistsAsync();
            await _gameWordsTable.CreateIfNotExistsAsync();
            await _wordRatingsTable.CreateIfNotExistsAsync();
            await _wordsTable.CreateIfNotExistsAsync();
            await _categoriesTable.CreateIfNotExistsAsync();
            await _wordTypesTable.CreateIfNotExistsAsync();
            await _lookupsTable.CreateIfNotExistsAsync();
            await _wordDifficultiesTable.CreateIfNotExistsAsync();

            await SeedGameTypesAsync();
            await SeedWordTypesAsync(KnownTypeNames);
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

        public async Task<WordEntity?> GetRandomWordAsync(List<string> wordClasses)
        {
            // On a stale RowKey (404) we evict the partition's cached list and retry once,
            // so a deleted word doesn't masquerade as "no words available".
            for (var attempt = 0; attempt < 2; attempt++)
            {
                var perClass = new List<(string Pk, List<string> Keys)>();
                var total = 0;
                foreach (var wc in wordClasses)
                {
                    var ids = await GetWordIdsForClassAsync(wc);
                    if (ids.Count == 0) continue;
                    perClass.Add((wc, ids));
                    total += ids.Count;
                }

                if (total == 0) return null;

                var offset = Random.Shared.Next(total);
                var stale = false;
                foreach (var (pk, keys) in perClass)
                {
                    if (offset < keys.Count)
                    {
                        try
                        {
                            return await _wordsTable.GetEntityAsync<WordEntity>(pk, keys[offset]);
                        }
                        catch (RequestFailedException ex) when (ex.Status == 404)
                        {
                            _wordIdsByClass.TryRemove(pk, out _);
                            stale = true;
                        }
                        break;
                    }
                    offset -= keys.Count;
                }

                if (!stale) break;
            }
            return null;
        }

        private async Task<List<string>> GetWordIdsForClassAsync(string wordClass)
        {
            var lazy = _wordIdsByClass.GetOrAdd(
                wordClass,
                wc => new Lazy<Task<List<string>>>(() => LoadWordIdsAsync(wc), LazyThreadSafetyMode.ExecutionAndPublication));
            try
            {
                return await lazy.Value;
            }
            catch
            {
                _wordIdsByClass.TryRemove(wordClass, out _);
                throw;
            }
        }

        private async Task<List<string>> LoadWordIdsAsync(string wordClass)
        {
            var ids = new List<string>();
            var query = _wordsTable.QueryAsync<WordEntity>(
                filter: w => w.PartitionKey == wordClass,
                select: new[] { "RowKey" });
            await foreach (var w in query)
            {
                ids.Add(w.RowKey);
            }
            return ids;
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

        // WordTypes
        public async Task<List<WordTypeEntity>> GetEnabledWordTypesAsync()
        {
            var query = _wordTypesTable.QueryAsync<WordTypeEntity>(t => t.Enabled);
            var results = new List<WordTypeEntity>();
            await foreach (var item in query)
            {
                results.Add(item);
            }
            return results;
        }

        public async Task<WordTypeEntity?> GetWordTypeAsync(string wordClass, string typeCode)
        {
            try
            {
                return await _wordTypesTable.GetEntityAsync<WordTypeEntity>(wordClass, typeCode);
            }
            catch (RequestFailedException ex) when (ex.Status == 404)
            {
                return null;
            }
        }

        public async Task<string?> GetCategoryNameByWordClassAsync(string wordClass)
        {
            var query = _categoriesTable.QueryAsync<CategoryEntity>(c => c.RowKey == wordClass);
            await foreach (var item in query)
            {
                return item.Name;
            }
            return null;
        }

        public async Task SeedWordTypesAsync(IReadOnlyDictionary<string, string> knownNames)
        {
            var seen = new HashSet<(string, string)>();
            var wordQuery = _wordsTable.QueryAsync<WordEntity>(
                select: new[] { "PartitionKey", "Category" });

            await foreach (var word in wordQuery)
            {
                var key = (word.PartitionKey, word.Category);
                if (!seen.Add(key) || string.IsNullOrEmpty(word.Category))
                    continue;

                try
                {
                    await _wordTypesTable.GetEntityAsync<WordTypeEntity>(word.PartitionKey, word.Category);
                }
                catch (RequestFailedException ex) when (ex.Status == 404)
                {
                    var name = knownNames.TryGetValue(word.Category, out var n) ? n : word.Category;
                    await _wordTypesTable.AddEntityAsync(new WordTypeEntity
                    {
                        PartitionKey = word.PartitionKey,
                        RowKey = word.Category,
                        Name = name,
                        Enabled = true
                    });
                }
            }
        }

        private async Task SeedGameTypesAsync()
        {
            var seeds = new[]
            {
                new LookupEntity { PartitionKey = "gameType", RowKey = "drawing",     Name = "Teikna",  Description = "Teiknaðu orðið og láttu hina giska.",                    Enabled = true },
                new LookupEntity { PartitionKey = "gameType", RowKey = "explanation", Name = "Útskýra", Description = "Útskýrðu orðið með orðum án þess að segja það.", Enabled = true },
                new LookupEntity { PartitionKey = "gameType", RowKey = "acting",      Name = "Leika",   Description = "Leikið orðið og láttu hina giska.",                      Enabled = true },
            };

            foreach (var seed in seeds)
            {
                try
                {
                    await _lookupsTable.GetEntityAsync<LookupEntity>(seed.PartitionKey, seed.RowKey);
                }
                catch (RequestFailedException ex) when (ex.Status == 404)
                {
                    var now = DateTime.UtcNow;
                    seed.CreatedAt = now;
                    seed.UpdatedAt = now;
                    await _lookupsTable.AddEntityAsync(seed);
                }
            }
        }

        // Lookups
        public async Task<LookupEntity?> GetLookupAsync(string partitionKey, string rowKey)
        {
            try
            {
                return await _lookupsTable.GetEntityAsync<LookupEntity>(partitionKey, rowKey);
            }
            catch (RequestFailedException ex) when (ex.Status == 404)
            {
                return null;
            }
        }

        public async Task<List<LookupEntity>> GetLookupsAsync(string partitionKey)
        {
            var query = _lookupsTable.QueryAsync<LookupEntity>(e => e.PartitionKey == partitionKey);
            var results = new List<LookupEntity>();
            await foreach (var item in query)
            {
                results.Add(item);
            }
            return results;
        }

        public async Task<List<LookupEntity>> GetEnabledLookupsAsync(string partitionKey)
        {
            var query = _lookupsTable.QueryAsync<LookupEntity>(e => e.PartitionKey == partitionKey && e.Enabled);
            var results = new List<LookupEntity>();
            await foreach (var item in query)
            {
                results.Add(item);
            }
            return results;
        }

        public async Task UpsertLookupAsync(LookupEntity lookup)
        {
            var existing = await GetLookupAsync(lookup.PartitionKey, lookup.RowKey);
            var now = DateTime.UtcNow;
            lookup.CreatedAt = existing?.CreatedAt ?? now;
            lookup.UpdatedAt = now;
            await _lookupsTable.UpsertEntityAsync(lookup);
        }

        // Word difficulties
        public async Task<WordDifficultyEntity?> GetWordDifficultyAsync(string gameTypeCode, string wordId)
        {
            try
            {
                return await _wordDifficultiesTable.GetEntityAsync<WordDifficultyEntity>(gameTypeCode, wordId);
            }
            catch (RequestFailedException ex) when (ex.Status == 404)
            {
                return null;
            }
        }

        public async Task UpsertWordDifficultyAsync(WordDifficultyEntity entity)
        {
            entity.UpdatedAt = DateTime.UtcNow;
            await _wordDifficultiesTable.UpsertEntityAsync(entity);
        }
    }
}
