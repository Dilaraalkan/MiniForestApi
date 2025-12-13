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

    // [GET] Tüm oturumlar (Test için)
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var sessions = await _context.FocusSessions.ToListAsync();
        return Ok(new { success = true, body = sessions });
    }

    // [GET] Kullanıcıya özel oturumlar
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserSessions(int userId)
    {
        var sessions = await _context.FocusSessions
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.StartTime)
            .ToListAsync();

        return Ok(new { success = true, body = sessions });
    }

    // [POST] Yeni oturum başlat
    [HttpPost("start")]
    public async Task<IActionResult> StartSession([FromBody] StartFocusDto request)
    {
        if (request.DurationMinutes < 1)
            return BadRequest(new { success = false, message = "Süre en az 1 dakika olmalı." });

        if (request.UserId <= 0)
            return BadRequest(new { success = false, message = "Geçersiz kullanıcı ID." });

        // Kullanıcı kontrolü
        var userExists = await _context.Users.AnyAsync(u => u.Id == request.UserId);
        if (!userExists)
            return NotFound(new { success = false, message = "Kullanıcı bulunamadı." });

        // YENİ OTURUM OLUŞTURULUYOR
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

    // [POST] Oturumu bitir
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

    // 1. GET (Single): Tek bir kaydı getir
    // Örnek: GET /Focus/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetSessionById(int id)
    {
        var session = await _context.FocusSessions.FindAsync(id);
        if (session == null) 
            return NotFound(new { success = false, message = "Kayıt bulunamadı." });

        return Ok(new { success = true, body = session });
    }

    // 2. DELETE: Bir kaydı sil
    // Örnek: DELETE /Focus/5
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

    // 3. PUT: Kaydı tamamen güncelle (Süre, Ağaç ve Not değişir)
    // Örnek: PUT /Focus/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSessionFull(int id, [FromBody] UpdateSessionDto request)
    {
        var session = await _context.FocusSessions.FindAsync(id);
        if (session == null) return NotFound(new { success = false, message = "Kayıt bulunamadı." });

        // Tüm alanları yenisiyle değiştiriyoruz
        session.DurationMinutes = request.DurationMinutes;
        session.TreeType = request.TreeType;
        session.Note = request.Note;

        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = "Oturum tamamen güncellendi.", body = session });
    }

    // 4. PATCH: Sadece bir alanı güncelle (Örn: Sadece Not ekle)
    // Örnek: PATCH /Focus/5/note
    [HttpPatch("{id}/note")]
    public async Task<IActionResult> UpdateSessionNote(int id, [FromBody] string note)
    {
        var session = await _context.FocusSessions.FindAsync(id);
        if (session == null) return NotFound(new { success = false, message = "Kayıt bulunamadı." });

        // Sadece notu değiştiriyoruz, diğerlerine dokunmuyoruz
        session.Note = note;

        await _context.SaveChangesAsync();
        return Ok(new { success = true, message = "Not eklendi.", body = session });
    }
}