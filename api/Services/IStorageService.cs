using EzOrd.Models;

namespace EzOrd.Services
{
    public interface IStorageService
    {
        Task InitializeAsync();

        Task<GameEntity?> GetGameAsync(string gameId);
        Task InsertGameAsync(GameEntity game);
        Task UpdateGameAsync(GameEntity game);

        Task InsertGameWordAsync(GameWordEntity gameWord);
        Task<List<GameWordEntity>> GetGameWordsAsync(string gameId);
        Task<int> GetGameWordCountAsync(string gameId);

        Task InsertRatingAsync(WordRatingEntity rating);
        Task<WordRatingEntity?> GetRatingAsync(string wordId, string gameId);

        Task<WordEntity?> GetWordAsync(string wordId, string category);
        Task<WordEntity?> GetRandomWordAsync(List<string> wordClasses);
        Task UpdateWordUsageAsync(WordEntity word);

        Task<List<CategoryEntity>> GetEnabledCategoriesAsync();

        Task<List<WordTypeEntity>> GetEnabledWordTypesAsync();
        Task<WordTypeEntity?> GetWordTypeAsync(string wordClass, string typeCode);
        Task<string?> GetCategoryNameByWordClassAsync(string wordClass);
        Task SeedWordTypesAsync(IReadOnlyDictionary<string, string> knownNames);

        // Lookups
        Task<LookupEntity?> GetLookupAsync(string partitionKey, string rowKey);
        Task<List<LookupEntity>> GetLookupsAsync(string partitionKey);
        Task<List<LookupEntity>> GetEnabledLookupsAsync(string partitionKey);
        Task UpsertLookupAsync(LookupEntity lookup);

        // Word difficulties
        Task<WordDifficultyEntity?> GetWordDifficultyAsync(string gameTypeCode, string wordId);
        Task UpsertWordDifficultyAsync(WordDifficultyEntity entity);
    }
}
