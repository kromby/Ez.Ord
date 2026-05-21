namespace EzOrd.Models;

public class GameDetailsResponse
{
    public string GameId { get; set; } = string.Empty;
    public string GameType { get; set; } = string.Empty;
    public List<string> Categories { get; set; } = new();
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public List<GameWordDetailsDto> Words { get; set; } = new();
}
