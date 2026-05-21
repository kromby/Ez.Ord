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
}
