using System.Text;
using Backend.Context;
using Backend.Data;
using Backend.Models.Usuarios;
using Backend.Repositories;
using Backend.Repositories.Interfaces;
using Backend.Services;
using Backend.Services.Interfaces;
using System.Net;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using Serilog.Events;
using Shared.DTOs;
using Shared.Models;
using System.Threading.RateLimiting;

namespace Backend;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        var logsPath = Path.Combine(builder.Environment.ContentRootPath, "logs");
        Directory.CreateDirectory(logsPath);

        Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Information()
            .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
            .MinimumLevel.Override("Microsoft.Hosting.Lifetime", LogEventLevel.Information)
            .Enrich.FromLogContext()
            .WriteTo.Console()
            .WriteTo.File(Path.Combine(logsPath, "backend-.log"), rollingInterval: RollingInterval.Day, retainedFileCountLimit: 30,
                outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}")
            .CreateLogger();

        try
        {
            Log.Information("Iniciando CanilApp Backend...");

            var urls = builder.Configuration["Urls"];
            if (!string.IsNullOrWhiteSpace(urls))
                builder.WebHost.UseUrls(urls);

            builder.Host.UseSerilog();

            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();

            // Nginx (ou outro proxy) no Droplet: preserva esquema HTTPS e IP real do cliente.
            builder.Services.Configure<ForwardedHeadersOptions>(options =>
            {
                options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
                options.KnownNetworks.Clear();
                options.KnownProxies.Clear();
                options.KnownProxies.Add(IPAddress.Loopback);
                options.KnownProxies.Add(IPAddress.IPv6Loopback);
            });

            var corsOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AppCors", policy =>
                {
                    if (corsOrigins.Length > 0)
                    {
                        policy.WithOrigins(corsOrigins)
                            .AllowAnyHeader()
                            .AllowAnyMethod()
                            .AllowCredentials();
                    }
                    else if (builder.Environment.IsDevelopment())
                    {
                        policy.SetIsOriginAllowed(origin =>
                            {
                                if (string.IsNullOrEmpty(origin)) return false;
                                var uri = new Uri(origin);
                                return uri.Host is "localhost" or "127.0.0.1" or "::1"
                                    || uri.Host.StartsWith("192.168.", StringComparison.Ordinal)
                                    || uri.Host.StartsWith("10.", StringComparison.Ordinal);
                            })
                            .AllowAnyHeader()
                            .AllowAnyMethod()
                            .AllowCredentials();
                    }
                    else
                    {
                        policy.AllowAnyOrigin()
                            .AllowAnyHeader()
                            .AllowAnyMethod();
                    }
                });
            });

            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "CanilApp API", Version = "v1" });
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Description = "JWT no header Authorization. Cole só o token ou use: Bearer {seu_token}",
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                });
                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
                        },
                        Array.Empty<string>()
                    }
                });
            });

            var rawConnection = builder.Configuration.GetConnectionString("DefaultConnection")
                ?? "Data Source=data/canilapp.db";
            var sqliteConnection = SqliteConnectionResolver.Resolve(rawConnection, builder.Environment.ContentRootPath);
            builder.Services.AddDbContext<CanilAppDbContext>(options =>
                options.UseSqlite(sqliteConnection));

            var jwtSecret = builder.Configuration["Jwt:SecretKey"]
                ?? throw new InvalidOperationException("Jwt:SecretKey não configurada.");
            var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "CanilApp";
            var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "CanilApp";

            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
                        ValidateIssuer = true,
                        ValidIssuer = jwtIssuer,
                        ValidateAudience = true,
                        ValidAudience = jwtAudience,
                        ValidateLifetime = true,
                        ClockSkew = TimeSpan.FromMinutes(5)
                    };
                });

            builder.Services.AddRateLimiter(options =>
            {
                options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
                options.AddPolicy("sync-policy", context =>
                {
                    var partition = context.User.Identity?.Name
                        ?? context.Request.Headers.Authorization.ToString()
                        ?? context.Connection.RemoteIpAddress?.ToString()
                        ?? "anonymous";
                    return RateLimitPartition.GetFixedWindowLimiter(
                        partition,
                        _ => new FixedWindowRateLimiterOptions
                        {
                            AutoReplenishment = true,
                            PermitLimit = 5,
                            Window = TimeSpan.FromSeconds(10),
                            QueueLimit = 3,
                            QueueProcessingOrder = QueueProcessingOrder.OldestFirst
                        });
                });
            });

            builder.Services.AddScoped<IMedicamentosRepository, MedicamentosRepository>();
            builder.Services.AddScoped<IMedicamentosService, MedicamentosService>();
            builder.Services.AddScoped<IProdutosRepository, ProdutosRepository>();
            builder.Services.AddScoped<IProdutosService, ProdutosService>();
            builder.Services.AddScoped<IUsuariosRepository<UsuariosModel>, UsuariosRepository>();
            builder.Services.AddScoped<IUsuariosService<UsuarioResponseDTO>, UsuariosService>();
            builder.Services.AddScoped<IInsumosRepository, InsumosRepository>();
            builder.Services.AddScoped<IInsumosService, InsumosService>();
            builder.Services.AddScoped<EstoqueItemService>();
            builder.Services.AddScoped<EstoqueItemRepository>();
            builder.Services.AddScoped<RetiradaEstoqueService>();
            builder.Services.AddScoped<RetiradaEstoqueRepository>();
            builder.Services.AddScoped<IAuthService, AuthService>();

            var app = builder.Build();

            app.UseForwardedHeaders();

            using (var scope = app.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<CanilAppDbContext>();
                try
                {
                    db.Database.Migrate();
                }
                catch (Exception ex)
                {
                    Log.Error(ex, "Erro ao aplicar migrations");
                    throw;
                }
            }

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
                app.UseDeveloperExceptionPage();
            }

            app.UseExceptionHandler(errorApp =>
            {
                errorApp.Run(async context =>
                {
                    context.Response.StatusCode = 500;
                    context.Response.ContentType = "application/json";
                    var feature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerPathFeature>();
                    var response = new ErrorResponse
                    {
                        Title = "Erro interno no servidor",
                        StatusCode = 500,
                        Message = feature?.Error.Message ?? "Erro desconhecido"
                    };
                    Log.Error(feature?.Error, "Erro não tratado");
                    await context.Response.WriteAsJsonAsync(response);
                });
            });

            app.UseCors("AppCors");
            app.UseRateLimiter();
            app.UseAuthentication();
            app.UseAuthorization();
            app.MapControllers();

            app.MapGet("/", () => new { status = "backend rodando", version = "1.0.0", timestamp = DateTime.UtcNow });
            app.MapGet("/api/health", () => Results.Ok("OK"));

            app.Run();
        }
        catch (Exception ex)
        {
            Log.Fatal(ex, "Backend falhou ao iniciar");
            throw;
        }
        finally
        {
            Log.CloseAndFlush();
        }
    }
}
