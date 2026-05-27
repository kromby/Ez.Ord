using Azure;
using Azure.Data.Tables;

namespace EzOrd.Models;

public class WordDifficultyEntity : ITableEntity
{
    public string PartitionKey { get; set; } = string.Empty; // Game-type code (e.g. "drawing")
    public string RowKey { get; set; } = string.Empty; // Word ID (BIN-id)
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }

    public int Difficulty { get; set; } // 1..10
    public DateTime UpdatedAt { get; set; }
}
