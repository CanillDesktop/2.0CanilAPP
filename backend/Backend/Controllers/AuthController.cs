using Backend.Models;
using Backend.DTOs.Usuario;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IRefreshTokenService _refreshTokenService;
    private readonly IUsuariosService _usuariosService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, IRefreshTokenService refreshTokenService, IUsuariosService usuariosService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _refreshTokenService = refreshTokenService;
        _usuariosService = usuariosService;
        _logger = logger;
    }

    [HttpPost("login")]
    public async Task<IActionResult> LoginAsync([FromBody] LoginRequest? request, CancellationToken cancellationToken)
    {
        try
        {
            if (request is null || string.IsNullOrWhiteSpace(request.Login) || string.IsNullOrWhiteSpace(request.Senha))
            {
                throw new ArgumentNullException(null, "Login e senha são obrigatórios");
            }

            _logger.LogInformation("Solicitação de login recebida para {Login}.", request.Login);

            var result = await _authService.AuthenticateAsync(request.Login, request.Senha, cancellationToken);

            SetRefreshCookie(result.TokenResponse!.RefreshToken);

            return Ok(new
            {
                result.TokenResponse!.AccessToken,
                result.Usuario
            });
        }
        catch (ArgumentNullException ex)
        {
            return BadRequest(new ErrorResponse
            {
                Title = "Acesso não autorizado",
                Status = StatusCodes.Status400BadRequest,
                Details = ex.Message
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            return BadRequest(new ErrorResponse
            {
                Title = "Acesso não autorizado",
                Status = StatusCodes.Status400BadRequest,
                Details = ex.Message ?? "Usuário inativo. Favor contatar o suporte/administradores"
            });
        }
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(CancellationToken cancellationToken)
    {
        try
        {
            var refreshToken = Request.Cookies["refreshToken"];

            if (string.IsNullOrWhiteSpace(refreshToken))
            {
                throw new UnauthorizedAccessException();
            }

            var result = await _authService.RefreshTokenAsync(refreshToken, cancellationToken);

            SetRefreshCookie(result.RefreshToken);

            return Ok(result.AccessToken);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new ErrorResponse
            {
                Title = "Sessão inválida",
                Status = StatusCodes.Status401Unauthorized,
                Details = ex.Message ?? "Sessão inválida. Por favor, faça login novamente"
            });
        }
    }

    [Authorize]
    [HttpPost("confirmar-senha")]
    public async Task<IActionResult> ConfirmarSenha([FromBody] ConfirmacaoSenhaRequestDTO dto)
    {
        var claimId = User.FindFirstValue(JwtRegisteredClaimNames.Sub) ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(claimId, out var usuarioId))
            return Unauthorized(new ErrorResponse
            {
                Title = "Acesso não autorizado",
                Status = StatusCodes.Status401Unauthorized,
                Details = "Sessão inválida."
            });

        var senhaValida = await _usuariosService.ConfirmarSenhaUsuarioAsync(usuarioId, dto.SenhaConfirmacao);
        if (!senhaValida)
            return Unauthorized(new ErrorResponse
            {
                Title = "Senha inválida",
                Status = StatusCodes.Status401Unauthorized,
                Details = "Não foi possível confirmar a senha informada."
            });

        return Ok(new { confirmado = true });
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        try
        {
            var refreshToken = Request.Cookies["refreshToken"];

            if (string.IsNullOrWhiteSpace(refreshToken))
            {
                throw new UnauthorizedAccessException();
            }

            await _refreshTokenService.RevokeRefreshTokenAsync(refreshToken);

            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new ErrorResponse
            {
                Title = "Acesso não autorizado",
                Status = StatusCodes.Status401Unauthorized,
                Details = ex.Message ?? "Sessão inválida"
            });
        }
    }

    private void SetRefreshCookie(RefreshToken refreshToken)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true, // javascript não pode acessar
            Secure = true, // só envia em HTTPS
            SameSite = SameSiteMode.Lax,
            Expires = refreshToken.ExpiresAt
        };
        Response.Cookies.Append("refreshToken", refreshToken.TokenHash, cookieOptions);
    }
}
public record LoginRequest(string Login, string Senha);
