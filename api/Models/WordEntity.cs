using Azure;
using Azure.Data.Tables;

namespace EzOrd.Models;

public class WordEntity : ITableEntity
{
    public string PartitionKey { get; set; } = string.Empty; // BIN word-class code (hk, kk, kvk, lo, so, ...)
    public string RowKey { get; set; } = string.Empty; // Word ID (BIN-id)
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }

    public string Word { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int UsageCount { get; set; } = 0;
}
