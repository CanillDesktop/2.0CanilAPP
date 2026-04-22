using Backend.DTOs.Usuario;
using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace Backend.Services;

public class AuthService : IAuthService
{
    private readonly IUsuariosService<UsuarioResponseDTO> _usuariosService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUsuariosService<UsuarioResponseDTO> usuariosService,
        IConfiguration configuration,
        ILogger<AuthService> logger)
    {
        _usuariosService = usuariosService;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<LoginResponseModel> AuthenticateAsync(string login, string senha, CancellationToken cancellationToken = default)
    {
        var usuario = await _usuariosService.ValidarUsuarioAsync(login, senha);
        if (usuario == null || usuario.Id is not int userId)
        {
            _logger.LogWarning("Falha de autenticação para {Login}.", login);
            throw new UnauthorizedAccessException("Usuário ou senha inválidos");
        }

        var refreshToken = GenerateOpaqueRefreshToken();
        var refreshDays = _configuration.GetValue("Jwt:RefreshTokenDays", 14);
        await _usuariosService.SalvarRefreshTokenAsync(userId, refreshToken, DateTime.UtcNow.AddDays(refreshDays));

        var accessToken = CreateJwtToken(usuario);
        var expiresIn = _configuration.GetValue("Jwt:AccessTokenMinutes", 60) * 60;

        usuario.CognitoSub = userId.ToString();

        return new LoginResponseModel
        {
            Token = new TokenResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                IdToken = accessToken,
                ExpiresIn = expiresIn
            },
            Usuario = usuario
        };
    }

    public async Task<TokenResponse> RefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        var usuario = await _usuariosService.BuscaPorRefreshTokenAsync(refreshToken);
        if (usuario == null || usuario.Id is not int userId)
            throw new UnauthorizedAccessException("Sessão expirada. Por favor, faça login novamente.");

        var newRefresh = GenerateOpaqueRefreshToken();
        var refreshDays = _configuration.GetValue("Jwt:RefreshTokenDays", 14);
        await _usuariosService.SalvarRefreshTokenAsync(userId, newRefresh, DateTime.UtcNow.AddDays(refreshDays));

        usuario.CognitoSub = userId.ToString();
        var accessToken = CreateJwtToken(usuario);
        var expiresIn = _configuration.GetValue("Jwt:AccessTokenMinutes", 60) * 60;

        return new TokenResponse
        {
            AccessToken = accessToken,
            RefreshToken = newRefresh,
            IdToken = accessToken,
            ExpiresIn = expiresIn
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
        var accessMinutes = _configuration.GetValue("Jwt:AccessTokenMinutes", 60);

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, usuario.Id?.ToString() ?? ""),
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
