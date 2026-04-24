using Backend.Models;
using Backend.Models.Usuarios;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;

namespace Backend.Services
{
    public class RefreshTokenService : IRefreshTokenService
    {
        private readonly IRefreshTokenRepository _repository;
        public RefreshTokenService(IRefreshTokenRepository repository)
        {
            _repository = repository;
        }

        public async Task<RefreshToken?> SaveRefreshTokenAsync(RefreshToken refreshToken)
        {
            return await _repository.SaveRefreshTokenAsync(refreshToken);
        }

        public async Task<RefreshToken?> GetRefreshTokenAsync(string refreshTokenHash)
        {
            return await _repository.GetRefreshTokenAsync(refreshTokenHash);
        }

        public async Task<RefreshToken?> ReplaceRefreshTokenAsync(RefreshToken oldToken, RefreshToken newToken)
        {
            RevokeRefreshToken(oldToken, newToken);

            return await _repository.ReplaceRefreshTokenAsync(oldToken, newToken);

        }

        private static void RevokeRefreshToken(RefreshToken oldToken, RefreshToken newToken)
        {
            oldToken.ReplacedByTokenHash = newToken.TokenHash;
            oldToken.RevokedAt = DateTime.UtcNow;
        }
    }
}
