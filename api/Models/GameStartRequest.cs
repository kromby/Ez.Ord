namespace EzOrd.Models;

public class GameStartRequest
{
    public string GameType { get; set; } = string.Empty; // drawing, explanation, acting
    public List<string> Categories { get; set; } = new();
}
