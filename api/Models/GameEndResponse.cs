namespace EzOrd.Models;

public class GameEndResponse
{
    public string GameId { get; set; } = string.Empty;
    public DateTime EndedAt { get; set; }
    public int WordCount { get; set; }
}
