namespace EzOrd.Models;

public class GameWordDetailsDto
{
    public int Sequence { get; set; }
    public string Word { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public DateTime DrawnAt { get; set; }
    public string? Rating { get; set; } // easy, medium, hard, skipped, or null if not rated
}
