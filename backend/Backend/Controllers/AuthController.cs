using Backend.Exceptions;
using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IRefreshTokenService _refreshTokenService;
    private readonly ILogger<AuthController> _logger;
    private readonly IWebHostEnvironment _environment;

    public AuthController(
        IAuthService authService,
        IRefreshTokenService refreshTokenService,
        ILogger<AuthController> logger,
        IWebHostEnvironment environment)
    {
        _authService = authService;
        _refreshTokenService = refreshTokenService;
        _logger = logger;
        _environment = environment;
    }

    [HttpPost("login")]
    public async Task<IActionResult> LoginAsync([FromBody] LoginRequest? request, CancellationToken cancellationToken)
    {
        if (request is null || string.IsNullOrWhiteSpace(request.Login) || string.IsNullOrWhiteSpace(request.Senha))
        {
            return BadRequest(new ErrorResponse
            {
                Title = "Dados inválidos",
                Status = StatusCodes.Status400BadRequest,
                Details = "Login e senha são obrigatórios."
            });
        }

        try
        {
            _logger.LogInformation("Solicitação de login recebida para {Login}.", request.Login);

            var result = await _authService.AuthenticateAsync(request.Login, request.Senha, cancellationToken);

            if (result?.TokenResponse == null)
            {
                return Unauthorized(new ErrorResponse
                {
                    Title = "Acesso não autorizado",
                    Status = StatusCodes.Status401Unauthorized,
                    Details = "Usuário ou senha inválidos."
                });
            }

            SetRefreshCookie(result.TokenResponse.RefreshToken);

            return Ok(new
            {
                result.TokenResponse.AccessToken,
                result.Usuario
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new ErrorResponse
            {
                Title = "Acesso não autorizado",
                Status = StatusCodes.Status401Unauthorized,
                Details = ex.Message ?? "Usuário inativo. Favor contatar o suporte/administradores."
            });
        }
        catch (ArgumentNullException ex)
        {
            return BadRequest(new ErrorResponse
            {
                Title = "Acesso não autorizado",
                Status = StatusCodes.Status400BadRequest,
                Details = ex.Message ?? "Usuário ou senha inválidos."
            });
        }
        catch (AcessoNegadoException ex)
        {
            return StatusCode(ex.StatusCode, new ErrorResponse
            {
                Title = ex.Titulo,
                Status = ex.StatusCode,
                Details = ex.Message
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
                return Unauthorized(new ErrorResponse
                {
                    Title = "Sessão inválida",
                    Status = StatusCodes.Status401Unauthorized,
                    Details = "Sessão inválida. Por favor, faça login novamente.",
                });
            }

            var result = await _authService.RefreshTokenAsync(refreshToken, cancellationToken);

            SetRefreshCookie(result.RefreshToken);

            return Ok(result.AccessToken);
        }
        catch (ArgumentNullException ex)
        {
            return Unauthorized(new ErrorResponse
            {
                Title = "Sessão inválida",
                Status = StatusCodes.Status401Unauthorized,
                Details = ex.Message ?? "Sessão inválida. Por favor, faça login novamente.",
            });
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Falha ao renovar sessão.");
            return Unauthorized(new ErrorResponse
            {
                Title = "Sessão inválida",
                Status = StatusCodes.Status401Unauthorized,
                Details = "Sessão inválida. Por favor, faça login novamente.",
            });
        }
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
                throw new ArgumentNullException();
            }

            await _refreshTokenService.RevokeRefreshTokenAsync(refreshToken);

            return NoContent();
        }
        catch (ArgumentNullException ex)
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
            HttpOnly = true,
            Path = "/",
            Expires = refreshToken.ExpiresAt,
        };

        if (_environment.IsDevelopment())
        {
            cookieOptions.Secure = false;
            cookieOptions.SameSite = SameSiteMode.Lax;
        }
        else
        {
            cookieOptions.Secure = true;
            cookieOptions.SameSite = SameSiteMode.None;
        }

        Response.Cookies.Append("refreshToken", refreshToken.TokenHash, cookieOptions);
    }
}
public record LoginRequest(string Login, string Senha);
