using Azure;
using Azure.Data.Tables;

namespace EzOrd.Models
{
    public class GameEntity : ITableEntity
    {
        public string PartitionKey { get; set; } = string.Empty;
        public string RowKey { get; set; } = string.Empty;
        public DateTimeOffset? Timestamp { get; set; }
        public ETag ETag { get; set; }

        public DateTime StartedAt { get; set; }
        public DateTime? EndedAt { get; set; }
        public string Categories { get; set; } = string.Empty; // JSON array of category IDs
        public string? UserId { get; set; }
        public string GameType { get; set; } = string.Empty; // drawing, scrabble, word_explanation, acting
    }

    public class GameWordEntity : ITableEntity
    {
        public string PartitionKey { get; set; } = string.Empty; // Game ID
        public string RowKey { get; set; } = string.Empty; // Sequence number (0, 1, 2, ...)
        public DateTimeOffset? Timestamp { get; set; }
        public ETag ETag { get; set; }

        public string WordId { get; set; } = string.Empty;
        public string Word { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public DateTime DrawnAt { get; set; }
    }

    public class WordRatingEntity : ITableEntity
    {
        public string PartitionKey { get; set; } = string.Empty; // Word ID
        public string RowKey { get; set; } = string.Empty; // Game ID
        public DateTimeOffset? Timestamp { get; set; }
        public ETag ETag { get; set; }

        public string Difficulty { get; set; } = string.Empty; // easy, medium, hard, skipped
        public string GameType { get; set; } = string.Empty;
        public DateTime RatedAt { get; set; }
    }

    public class WordEntity : ITableEntity
    {
        public string PartitionKey { get; set; } = string.Empty; // Category (noun, verb, etc.)
        public string RowKey { get; set; } = string.Empty; // Word ID
        public DateTimeOffset? Timestamp { get; set; }
        public ETag ETag { get; set; }

        public string Word { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public int UsageCount { get; set; } = 0;
        public double? Rating { get; set; }
    }

    public class CategoryEntity
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }
}
