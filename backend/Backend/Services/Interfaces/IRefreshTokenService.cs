using Backend.Models;
using Backend.Models.Usuarios;

namespace Backend.Services.Interfaces
{
    public interface IRefreshTokenService
    {
        Task<RefreshToken?> SaveRefreshTokenAsync(RefreshToken refreshToken);
        Task<RefreshToken?> GetRefreshTokenAsync(string refreshTokenHash);
        Task<RefreshToken?> ReplaceRefreshTokenAsync(RefreshToken oldToken, RefreshToken newToken);
    }
}
