namespace EzOrd.Models;

public class GameStartResponse
{
    public string GameId { get; set; } = string.Empty;
    public string GameType { get; set; } = string.Empty;
    public List<string> Categories { get; set; } = new();
    public DateTime StartedAt { get; set; }
}
