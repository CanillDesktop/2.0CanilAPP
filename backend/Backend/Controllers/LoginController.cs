using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class LoginController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<LoginController> _logger;

    public LoginController(IAuthService authService, ILogger<LoginController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> LoginAsync([FromBody] LoginRequest? request, CancellationToken cancellationToken)
    {
        try
        {
            if (request is null || string.IsNullOrWhiteSpace(request.Login) || string.IsNullOrWhiteSpace(request.Senha))
            {
                return BadRequest(new ErrorResponse
                {
                    Title = "Requisição inválida",
                    Status = StatusCodes.Status400BadRequest,
                    Details = "Login e senha são obrigatórios"
                });
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
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new ErrorResponse
            {
                Title = "Acesso não autorizado",
                Status = StatusCodes.Status401Unauthorized,
                Details = ex.Message
            });
        }
    }

    [Authorize]
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

            return Ok(new
            {
                result.AccessToken
            });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new ErrorResponse
            {
                Title = "Sessão inválida",
                Status = StatusCodes.Status401Unauthorized,
                Details = "Sessão inválida. Por favor, faça login novamente"
            });
        }
    }

    private void SetRefreshCookie(RefreshToken refreshToken)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Lax,
            Expires = refreshToken.ExpiresAt
        };
        Response.Cookies.Append("refreshToken", refreshToken.TokenHash, cookieOptions);
    }
}
public record LoginRequest(string Login, string Senha);
