using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
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
            return Ok(result);
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
        catch (Exception ex)
        {
            _logger.LogError(ex, "Falha no login por erro inesperado.");
            return StatusCode(500, new ErrorResponse
            {
                Title = "Erro interno",
                Status = StatusCodes.Status500InternalServerError,
                Details = "Erro ao processar login"
            });
        }
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request, CancellationToken cancellationToken)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.RefreshToken))
            {
                return BadRequest(new ErrorResponse
                {
                    Title = "Requisição inválida",
                    Status = StatusCodes.Status400BadRequest,
                    Details = "RefreshToken obrigatório"
                });
            }

            var result = await _authService.RefreshTokenAsync(request.RefreshToken, cancellationToken);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new ErrorResponse
            {
                Title = "Token inválido",
                Status = StatusCodes.Status401Unauthorized,
                Details = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Falha na renovação do token por erro inesperado.");
            return StatusCode(500, new ErrorResponse
            {
                Title = "Erro interno",
                Status = StatusCodes.Status500InternalServerError,
                Details = "Erro ao renovar token"
            });
        }
    }
}

public record RefreshTokenRequest(string RefreshToken);
public record LoginRequest(string Login, string Senha);
