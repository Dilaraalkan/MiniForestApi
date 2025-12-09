using System;

public class TodaySummaryDto
{
    public DateTime Date { get; set; }
    public int TotalMinutes { get; set; }

    public TodaySummaryDto(DateTime date, int totalMinutes)
    {
        Date = date;
        TotalMinutes = totalMinutes;
    }
}

