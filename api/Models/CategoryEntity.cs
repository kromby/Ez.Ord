using Azure;
using Azure.Data.Tables;

namespace EzOrd.Models;

public class CategoryEntity : ITableEntity
{
    public string PartitionKey { get; set; } = string.Empty; // Friendly category id (nafnord, sagnord, ...)
    public string RowKey { get; set; } = string.Empty; // BIN word-class code (hk, kk, kvk, so, lo, ...)
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }

    public string Name { get; set; } = string.Empty; // Display name (Nafnorð, Sagnorð, ...)
    public bool Enabled { get; set; }
}
