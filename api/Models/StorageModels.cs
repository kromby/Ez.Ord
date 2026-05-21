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
        public string Categories { get; set; } = string.Empty; // JSON array of friendly category IDs (e.g. nafnord)
        public string WordClasses { get; set; } = string.Empty; // JSON array of BIN word-class codes resolved at start (e.g. hk, kk)
        public string? UserId { get; set; }
        public string GameType { get; set; } = string.Empty; // drawing, scrabble, word_explanation, acting
    }

    public class GameWordEntity : ITableEntity
    {
        public string PartitionKey { get; set; } = string.Empty; // Game ID
        public string RowKey { get; set; } = string.Empty; // GUID
        public DateTimeOffset? Timestamp { get; set; }
        public ETag ETag { get; set; }

        public int Sequence { get; set; }
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
        public string PartitionKey { get; set; } = string.Empty; // BIN word-class code (hk, kk, kvk, lo, so, ...)
        public string RowKey { get; set; } = string.Empty; // Word ID (BIN-id)
        public DateTimeOffset? Timestamp { get; set; }
        public ETag ETag { get; set; }

        public string Word { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public int UsageCount { get; set; } = 0;
        public double? Rating { get; set; }
    }

    public class CategoryEntity : ITableEntity
    {
        public string PartitionKey { get; set; } = string.Empty; // Friendly category id (nafnord, sagnord, ...)
        public string RowKey { get; set; } = string.Empty; // BIN word-class code (hk, kk, kvk, so, lo, ...)
        public DateTimeOffset? Timestamp { get; set; }
        public ETag ETag { get; set; }

        public string Name { get; set; } = string.Empty; // Display name (Nafnorð, Sagnorð, ...)
        public bool Enabled { get; set; }
    }
}
