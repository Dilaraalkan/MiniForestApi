 /*using MiniForestApp.Models;

public class FocusSessionDto(FocusSession session)
{
    public int Id { get; set; } = session.Id;
    public int DurationMinutes { get; set; } = session.DurationMinutes;
    public DateTime StartTime { get; set; } = session.StartTime;
    public DateTime? EndTime { get; set; } = session.EndTime;
    public bool IsCompleted { get; set; } = session.IsCompleted;
}*/ 
using MiniForestApp.Models;

public class FocusSessionDto
{
    public int Id { get; set; }
    public int DurationMinutes { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public bool IsCompleted { get; set; }

    // Eski primary constructor'un yaptığı işi bu klasik constructor yapıyor
    public FocusSessionDto(FocusSession session)
    {
        Id = session.Id;
        DurationMinutes = session.DurationMinutes;
        StartTime = session.StartTime;
        EndTime = session.EndTime;
        IsCompleted = session.IsCompleted;
    }
}

