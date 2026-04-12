using Shared.DTOs;
using Shared.Models;

namespace Backend.Services.Interfaces;

public interface IAuthService
{
    Task<LoginResponseModel> AuthenticateAsync(string login, string senha, CancellationToken cancellationToken = default);
    Task<TokenResponse> RefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default);
}
