using System.ComponentModel.DataAnnotations;

namespace MiniForestApp.Models.DTO;

public class RegisterDto
{
    [Required]
    public string Username { get; set; } = string.Empty;
    
    [Required]
    [MinLength(3, ErrorMessage = "Şifre en az 3 karakter olmalı")]
    public string Password { get; set; } = string.Empty;
}

public class LoginDto
{
    [Required]
    public string Username { get; set; } = string.Empty;
    
    [Required]
    public string Password { get; set; } = string.Empty;
}