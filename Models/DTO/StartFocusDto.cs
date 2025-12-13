namespace MiniForestApp.Models.DTO; 
public class StartFocusDto
{
    public int DurationMinutes { get; set; }
    
    public int UserId { get; set; }

    public string TreeType { get; set; } = "🌲";

    public StartFocusDto() { }

    public StartFocusDto(int durationMinutes, int userId)
    {
        DurationMinutes = durationMinutes;
        UserId = userId;
    }
}