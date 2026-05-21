using Azure;
using Azure.Data.Tables;

namespace EzOrd.Models;

public class WordTypeEntity : ITableEntity
{
    public string PartitionKey { get; set; } = string.Empty; // BIN word-class code (hk, kk, kvk, so, ...)
    public string RowKey { get; set; } = string.Empty; // type short code (alm, ism, örn, ...)
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }

    public string Name { get; set; } = string.Empty;
    public bool Enabled { get; set; } = true;
}
