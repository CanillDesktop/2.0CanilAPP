using Backend.Models.Enums;
using Backend.Repositories.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Text.Json;

namespace Backend.Middleware;

/// <summary>
/// Invalida JWTs emitidos antes de inativação, reativação, troca de senha ou exclusão
/// comparando a claim TokenVersion com o valor persistido no usuário.
/// Também bloqueia contas não ativas como defesa em profundidade.
/// </summary>
public class TokenVersionValidationMiddleware
{
    private readonly RequestDelegate _next;

    public TokenVersionValidationMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IUsuariosRepository usuariosRepository)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var userIdRaw = context.User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            var tokenVersionRaw = context.User.FindFirst("TokenVersion")?.Value;

            if (int.TryParse(userIdRaw, out var userId))
            {
                var snapshot = await usuariosRepository.ObterSnapshotSessaoAsync(userId);

                if (snapshot is null
                    || snapshot.Status != StatusUsuario.Ativo
                    || !int.TryParse(tokenVersionRaw, out var tokenVersion)
                    || snapshot.TokenVersion != tokenVersion)
                {
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    context.Response.ContentType = "application/json";
                    await context.Response.WriteAsync(JsonSerializer.Serialize(new
                    {
                        title = "Sessão inválida",
                        status = 401,
                        details = "Sua sessão expirou ou foi revogada. Faça login novamente."
                    }));
                    return;
                }
            }
        }

        await _next(context);
    }
}

public static class TokenVersionValidationMiddlewareExtensions
{
    public static IApplicationBuilder UseTokenVersionValidation(this IApplicationBuilder app)
        => app.UseMiddleware<TokenVersionValidationMiddleware>();
}
