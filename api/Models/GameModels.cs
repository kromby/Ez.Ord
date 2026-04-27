namespace EzOrd.Models
{
    // Requests
    public class GameStartRequest
    {
        public string GameType { get; set; } = string.Empty; // drawing, scrabble, word_explanation, acting
        public List<string> Categories { get; set; } = new();
    }

    public class RateWordRequest
    {
        public string WordId { get; set; } = string.Empty;
        public string DifficultyRating { get; set; } = string.Empty; // easy, medium, hard
    }

    public class SkipWordRequest
    {
        public string WordId { get; set; } = string.Empty;
    }

    // Responses
    public class GameStartResponse
    {
        public string GameId { get; set; } = string.Empty;
        public string GameType { get; set; } = string.Empty;
        public List<string> Categories { get; set; } = new();
        public DateTime StartedAt { get; set; }
    }

    public class WordResponse
    {
        public string Word { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string WordId { get; set; } = string.Empty;
    }

    public class GameEndResponse
    {
        public string GameId { get; set; } = string.Empty;
        public DateTime EndedAt { get; set; }
        public int WordCount { get; set; }
    }

    public class GameDetailsResponse
    {
        public string GameId { get; set; } = string.Empty;
        public string GameType { get; set; } = string.Empty;
        public List<string> Categories { get; set; } = new();
        public DateTime StartedAt { get; set; }
        public DateTime? EndedAt { get; set; }
        public List<GameWordDetailsDto> Words { get; set; } = new();
    }

    public class GameWordDetailsDto
    {
        public int Sequence { get; set; }
        public string Word { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public DateTime DrawnAt { get; set; }
        public string? Rating { get; set; } // easy, medium, hard, skipped, or null if not rated
    }

    public class CategoriesResponse
    {
        public List<CategoryDto> Categories { get; set; } = new();
    }

    public class CategoryDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }

    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public T? Data { get; set; }
        public string? Message { get; set; }
    }
}
