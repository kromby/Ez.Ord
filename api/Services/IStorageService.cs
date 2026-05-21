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
        Task<List<WordEntity>> GetWordsByCategoriesAsync(List<string> wordClasses);
        Task UpdateWordUsageAsync(WordEntity word);

        Task<List<CategoryEntity>> GetEnabledCategoriesAsync();
    }
}
