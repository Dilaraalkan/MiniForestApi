using Microsoft.AspNetCore.Mvc;
using MiniForestApp.Models;
using MiniForestApp.Models.DTO;
using Microsoft.EntityFrameworkCore;

namespace MiniForestApi.Controllers;

[ApiController]
[Route("[controller]")]
public class AuthController : ControllerBase
{
    private readonly MiniForestDbContext _context;

    public AuthController(MiniForestDbContext context)
    {
        _context = context;
    }

    // KAYIT OL (POST: /Auth/register)
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto request)
    {
        if (await _context.Users.AnyAsync(u => u.Username == request.Username))
        {
            return BadRequest("Bu kullanıcı adı zaten alınmış.");
        }

        var newUser = new User
        {
            Username = request.Username,
            Password = request.Password
        };

        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Kayıt başarılı!", userId = newUser.Id });
    }

    // GİRİŞ YAP (POST: /Auth/login)
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto request)
    {
        // Kullanıcıyı bul
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == request.Username && u.Password == request.Password);

        if (user == null)
        {
            return Unauthorized("Kullanıcı adı veya şifre hatalı.");
        }

        return Ok(new { message = "Giriş başarılı", userId = user.Id, username = user.Username });
    }
}