using Azure;
using Azure.Data.Tables;

namespace EzOrd.Models;

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
