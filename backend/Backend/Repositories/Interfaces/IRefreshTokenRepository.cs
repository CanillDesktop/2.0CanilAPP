using Backend.Models;

namespace Backend.Repositories.Interfaces
{
    public interface IRefreshTokenRepository
    {
        Task<RefreshToken?> SaveRefreshTokenAsync(RefreshToken refreshToken);

        Task<RefreshToken?> GetRefreshTokenAsync(string refreshTokenHash);

        Task<RefreshToken?> ReplaceRefreshTokenAsync(RefreshToken oldToken, RefreshToken newToken);
    }
}
