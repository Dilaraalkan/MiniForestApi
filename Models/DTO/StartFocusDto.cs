 /*public class StartFocusDto(int DurationMinutes)
{
    public int DurationMinutes { get; set; } = DurationMinutes;
}
*/
public class StartFocusDto
{
    public int DurationMinutes { get; set; }

    public StartFocusDto(int durationMinutes)
    {
        DurationMinutes = durationMinutes;
    }

    // Parametresiz constructor (bazı serializer'lar için gerekebilir)
    public StartFocusDto() { }
}
