using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniForestApi.Models.DTO;
using MiniForestApp.Models;
using MiniForestApp.Models.DTO;

namespace MiniForestApi.Controllers;

[ApiController]
[Route("[controller]")]
public class FocusController : ControllerBase
{
    private readonly MiniForestDbContext _context;

    public FocusController(MiniForestDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var sessions = await _context.FocusSessions.ToListAsync();
        return Ok(new { success = true, body = sessions });
    }

    [HttpGet("details/{id}")]
    public async Task<IActionResult> GetSessionDetails(int id)
    {
        var session = await _context.FocusSessions.FindAsync(id);
        if (session == null)
            return NotFound(new { success = false, message = "Kayıt bulunamadı." });

        var user = await _context.Users.FindAsync(session.UserId);

        return Ok(new
        {
            success = true,
            body = new
            {
                session.Id,
                session.DurationMinutes,
                session.StartTime,
                session.EndTime,
                session.IsCompleted,
                session.UserId,
                session.TreeType,
                session.Note,
                username = user?.Username
            }
        });
    }

    [HttpPost("start")]
    public async Task<IActionResult> StartSession([FromBody] StartFocusDto request)
    {
        if (request.DurationMinutes < 1)
            return BadRequest(new { success = false, message = "Süre en az 1 dakika olmalı." });

        if (request.UserId <= 0)
            return BadRequest(new { success = false, message = "Geçersiz kullanıcı ID." });

        var userExists = await _context.Users.AnyAsync(u => u.Id == request.UserId);
        if (!userExists)
            return NotFound(new { success = false, message = "Kullanıcı bulunamadı." });

        var session = new FocusSession
        {
            DurationMinutes = request.DurationMinutes,
            StartTime = DateTime.Now,
            IsCompleted = false,
            UserId = request.UserId,
            TreeType = request.TreeType
        };

        _context.FocusSessions.Add(session);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, body = session });
    }

    [HttpPost("finish/{id}")]
    public async Task<IActionResult> FinishSession(int id, [FromQuery] bool completed)
    {
        var session = await _context.FocusSessions.FindAsync(id);

        if (session == null)
            return NotFound(new { success = false, message = "Oturum bulunamadı." });

        session.IsCompleted = completed;
        session.EndTime = DateTime.Now;

        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Oturum güncellendi.", body = session });
    }

    // Standart ID ile getirme metodu (İsmi korundu)
    [HttpGet("{id}")]
    public async Task<IActionResult> GetSessionById(int id)
    {
        var session = await _context.FocusSessions.FindAsync(id);
        if (session == null)
            return NotFound(new { success = false, message = "Kayıt bulunamadı." });

        return Ok(new { success = true, body = session });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSession(int id)
    {
        var session = await _context.FocusSessions.FindAsync(id);
        if (session == null)
            return NotFound(new { success = false, message = "Silinecek kayıt bulunamadı." });

        _context.FocusSessions.Remove(session);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Oturum başarıyla silindi." });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSessionFull(int id, [FromBody] UpdateSessionDto request)
    {
        var session = await _context.FocusSessions.FindAsync(id);
        if (session == null) return NotFound(new { success = false, message = "Kayıt bulunamadı." });

        session.DurationMinutes = request.DurationMinutes;
        session.TreeType = request.TreeType;
        session.Note = request.Note;

        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = "Oturum tamamen güncellendi.", body = session });
    }

    [HttpPatch("{id}/note")]
    public async Task<IActionResult> UpdateSessionNote(int id, [FromBody] string note)
    {
        var session = await _context.FocusSessions.FindAsync(id);
        if (session == null) return NotFound(new { success = false, message = "Kayıt bulunamadı." });

        session.Note = note;

        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = "Not eklendi.", body = session });
    }
}