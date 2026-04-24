using Backend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Backend.Context;

/// <summary>
/// Usado apenas por <c>dotnet ef</c> (design-time), sem subir Kestrel nem aplicar migrations.
/// </summary>
public class CanilAppDbContextFactory : IDesignTimeDbContextFactory<CanilAppDbContext>
{
    public CanilAppDbContext CreateDbContext(string[] args)
    {
        var basePath = Directory.GetCurrentDirectory();
        var configuration = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var raw = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("ConnectionStrings:DefaultConnection não encontrada para design-time.");

        var resolved = SqliteConnectionResolver.Resolve(raw, basePath);

        var optionsBuilder = new DbContextOptionsBuilder<CanilAppDbContext>();
        optionsBuilder.UseSqlite(resolved);
        return new CanilAppDbContext(optionsBuilder.Options);
    }
}