using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace MiniForestApp.Models;

public partial class MiniForestDbContext : DbContext
{
    public MiniForestDbContext()
    {
    }

    public MiniForestDbContext(DbContextOptions<MiniForestDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<FocusSession> FocusSessions { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        // Configuration is handled in Program.cs via dependency injection
        if (!optionsBuilder.IsConfigured)
        {
            // Design-time tools için kullanılabilir.
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .UseCollation("utf8mb4_0900_ai_ci")
            .HasCharSet("utf8mb4");

        modelBuilder.Entity<FocusSession>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("focusSession");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.DurationMinutes).HasColumnName("durationMinutes");
            entity.Property(e => e.StartTime).HasColumnName("startTime");
            entity.Property(e => e.EndTime).HasColumnName("endTime");
            entity.Property(e => e.IsCompleted).HasColumnName("isCompleted");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
