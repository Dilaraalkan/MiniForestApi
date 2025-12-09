using System;

namespace MiniForestApp.Models; // burada da kendi namespace'ini kullan

public class FocusSession
{
    public int Id { get; set; }
    public int DurationMinutes { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public bool IsCompleted { get; set; }
}
