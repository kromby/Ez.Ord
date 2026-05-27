using Azure;
using Azure.Data.Tables;

namespace EzOrd.Models;

public class LookupEntity : ITableEntity
{
    public string PartitionKey { get; set; } = string.Empty; // Lookup-set name (e.g. "gameType")
    public string RowKey { get; set; } = string.Empty; // Code (e.g. "drawing")
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }

    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool Enabled { get; set; } = false;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
