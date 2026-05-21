namespace EzOrd.Models;

public class GameStartRequest
{
    public string GameType { get; set; } = string.Empty; // drawing, scrabble, word_explanation, acting
    public List<string> Categories { get; set; } = new();
}
