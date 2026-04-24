using Backend.DTOs.Usuario;
using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace Backend.Services;

public class AuthService : IAuthService
{
    private readonly IUsuariosService _usuariosService;
    private readonly IRefreshTokenService _refreshTokenService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUsuariosService usuariosService,
        IRefreshTokenService refreshTokenService,
        IConfiguration configuration,
        ILogger<AuthService> logger)
    {
        _usuariosService = usuariosService;
        _refreshTokenService = refreshTokenService;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<LoginResponseModel> AuthenticateAsync(string login, string senha, CancellationToken cancellationToken = default)
    {
        var usuario = await _usuariosService.ValidarUsuarioAsync(login, senha);
        if (usuario == null)
        {
            _logger.LogWarning("Falha de autenticação para {Login}.", login);
            throw new ArgumentNullException(null, "Usuário ou senha inválidos");
        }

        var refreshTokenHash = GenerateOpaqueRefreshToken();
        var refreshTokenExpiryDate = _configuration.GetValue("Jwt:RefreshTokenDays", 7);
        var refreshToken = new RefreshToken(refreshTokenHash, DateTime.UtcNow.AddDays(refreshTokenExpiryDate), usuario.Id);

        await _refreshTokenService.SaveRefreshTokenAsync(refreshToken);

        var accessToken = CreateJwtToken(usuario);

        return new LoginResponseModel
        {
            TokenResponse = new TokenResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken
            },
            Usuario = usuario
        };
    }

    public async Task<TokenResponse> RefreshTokenAsync(string refreshTokenHash, CancellationToken cancellationToken = default)
    {
        var refreshToken = await _refreshTokenService.GetRefreshTokenAsync(refreshTokenHash);

        if (refreshToken == null || !refreshToken.IsActive)
        {
            throw new UnauthorizedAccessException("Sua sessão expirou. Por favor, faça login novamente");
        }

        var usuario = await _usuariosService.BuscarPorIdAsync(refreshToken.UserId);

        if (usuario == null)
        {
            throw new ArgumentNullException(nameof(usuario), "RefreshToken não tem usuário atrelado");
        }

        var newRefreshTokenHash = GenerateOpaqueRefreshToken();
        var newRefreshTokenExpiryDate = _configuration.GetValue("Jwt:RefreshTokenDays", 7);

        var newRefreshToken = new RefreshToken(newRefreshTokenHash, DateTime.UtcNow.AddDays(newRefreshTokenExpiryDate), usuario.Id);

        await _refreshTokenService.ReplaceRefreshTokenAsync(refreshToken, newRefreshToken);

        var accessToken = CreateJwtToken(usuario);

        return new TokenResponse
        {
            AccessToken = accessToken,
            RefreshToken = newRefreshToken
        };
    }

    private string CreateJwtToken(UsuarioResponseDTO usuario)
    {
        var secret = _configuration["Jwt:SecretKey"]
            ?? throw new InvalidOperationException("Jwt:SecretKey não configurada.");
        if (secret.Length < 32)
            throw new InvalidOperationException("Jwt:SecretKey deve ter pelo menos 32 caracteres.");

        var issuer = _configuration["Jwt:Issuer"] ?? "CanilApp";
        var audience = _configuration["Jwt:Audience"] ?? "CanilApp";
        var accessMinutes = _configuration.GetValue("Jwt:AccessTokenMinutes", 15);

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, usuario.Id.ToString() ?? ""),
            new(JwtRegisteredClaimNames.Email, usuario.Email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new("permissao", usuario.Permissao.ToString())
        };

        var token = new JwtSecurityToken(
            issuer,
            audience,
            claims,
            expires: DateTime.UtcNow.AddMinutes(accessMinutes),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string GenerateOpaqueRefreshToken()
    {
        var bytes = new byte[48];
        RandomNumberGenerator.Fill(bytes);
        return Convert.ToBase64String(bytes);
    }
}
