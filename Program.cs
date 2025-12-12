using Microsoft.EntityFrameworkCore;
using MiniForestApp.Models; // Eğer hata verirse 'MiniForestApi.Models' dene

var builder = WebApplication.CreateBuilder(args);

// 1. VERITABANI BAGLANTISI (Eksik olan parça buydu)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<MiniForestDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// 2. SWAGGER SERVISLERI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 3. CORS AYARLARI (Frontend erişimi için)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddControllers();

var app = builder.Build();

// 4. GELISTIRME ORTAMI AYARLARI
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

app.UseAuthorization(); // İleride Login işlemi için lazım olacak

app.MapControllers();

app.Run();