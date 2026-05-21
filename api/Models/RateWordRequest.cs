namespace EzOrd.Models
{
    public class RateWordRequest
    {
        public string WordId { get; set; } = string.Empty;
        public string DifficultyRating { get; set; } = string.Empty; // easy, medium, hard
    }
}
