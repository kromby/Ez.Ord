using Azure;
using Azure.Data.Tables;

namespace EzOrd.Models
{
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
}
