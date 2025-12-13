namespace MiniForestApi.Models.DTO;

public class UpdateSessionDto
{
    public int DurationMinutes { get; set; }
    public string TreeType { get; set; } = "🌲";
    public string? Note { get; set; }
}