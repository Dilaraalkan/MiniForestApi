using Microsoft.AspNetCore.Mvc;
using MiniForestApp.Models; // yine kendi namespace'ine göre düzelt
using System;
using System.Collections.Generic;
using System.Linq;

[ApiController]
[Route("[controller]")]
public class FocusController : ControllerBase
{
    // Verileri RAM'de tutan static liste
    private static List<FocusSession> sessions = new List<FocusSession>();

    // GET /Focus
    [HttpGet]
    public IActionResult GetAll()
    {
        try
        {
            var result = sessions.Select(x => new FocusSessionDto(x)).ToList();
            return Ok(Response<List<FocusSessionDto>>.Successful(result));
        }
        catch (Exception ex)
        {
            return BadRequest(Response<List<FocusSessionDto>>.Fail(ex.Message));
        }
    }

    // POST /Focus/start
    [HttpPost("start")]
    public IActionResult StartSession(StartFocusDto dto)
    {
        try
        {
            if (dto.DurationMinutes <= 0)
                return BadRequest(Response<FocusSessionDto>.Fail("Süre 0'dan büyük olmalıdır."));

            int newId = sessions.Any() ? sessions.Max(x => x.Id) + 1 : 1;

            var session = new FocusSession()
            {
                Id = newId,
                DurationMinutes = dto.DurationMinutes,
                StartTime = DateTime.Now,
                IsCompleted = false
            };

            sessions.Add(session);

            return Ok(Response<FocusSessionDto>.Successful(new FocusSessionDto(session)));
        }
        catch (Exception ex)
        {
            return BadRequest(Response<FocusSessionDto>.Fail(ex.Message));
        }
    }

    // POST /Focus/finish/{id}
    [HttpPost("finish/{id}")]
    public IActionResult FinishSession(int id)
    {
        try
        {
            var found = sessions.FirstOrDefault(x => x.Id == id);
            if (found == null)
                return BadRequest(Response<FocusSessionDto>.Fail("Oturum bulunamadı."));

            if (!found.IsCompleted)
            {
                found.EndTime = DateTime.Now;
                found.IsCompleted = true;
            }

            return Ok(Response<FocusSessionDto>.Successful(new FocusSessionDto(found)));
        }
        catch (Exception ex)
        {
            return BadRequest(Response<FocusSessionDto>.Fail(ex.Message));
        }
    }

    // GET /Focus/today
    [HttpGet("today")]
    public IActionResult GetTodaySummary()
    {
        try
        {
            var today = DateTime.Today;
            var todaySessions = sessions
                .Where(x => x.StartTime.Date == today && x.IsCompleted)
                .ToList();

            var total = todaySessions.Sum(x => x.DurationMinutes);

            var dto = new TodaySummaryDto(today, total);

            return Ok(Response<TodaySummaryDto>.Successful(dto));
        }
        catch (Exception ex)
        {
            return BadRequest(Response<TodaySummaryDto>.Fail(ex.Message));
        }
    }

    // GET /Focus/{id}
    [HttpGet("{id}")]
    public IActionResult GetSession(int id)
    {
        try
        {
            var found = sessions.FirstOrDefault(x => x.Id == id);
            if (found == null)
                return BadRequest(Response<FocusSessionDto>.Fail("Oturum bulunamadı."));

            return Ok(Response<FocusSessionDto>.Successful(new FocusSessionDto(found)));
        }
        catch (Exception ex)
        {
            return BadRequest(Response<FocusSessionDto>.Fail(ex.Message));
        }
    }
}
