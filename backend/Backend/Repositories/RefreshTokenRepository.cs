using Backend.Context;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories
{
    public class RefreshTokenRepository : IRefreshTokenRepository
    {
        private readonly CanilAppDbContext _context;
        public RefreshTokenRepository(CanilAppDbContext context)
        {
            _context = context;
        }

        public async Task<RefreshToken?> SaveRefreshTokenAsync(RefreshToken refreshToken)
        {
            if (refreshToken is null)
            {
                throw new ArgumentNullException("O token não pode ser nulo.", nameof(refreshToken));
            }

            _context.RefreshTokens.Add(refreshToken);
            await _context.SaveChangesAsync();
            return refreshToken;
        }

        public async Task<RefreshToken?> GetRefreshTokenAsync(string refreshTokenHash)
        {
            if (string.IsNullOrWhiteSpace(refreshTokenHash))
            {
                throw new ArgumentException("O hash do refresh token não pode ser nulo ou vazio.", nameof(refreshTokenHash));
            }

            return await _context.RefreshTokens
                .FirstOrDefaultAsync(rt => rt.TokenHash == refreshTokenHash);
        }

        public async Task<RefreshToken?> ReplaceRefreshTokenAsync(RefreshToken oldToken, RefreshToken newToken)
        {
            if (oldToken == null || newToken == null)
            {
                throw new ArgumentNullException("Os tokens não podem ser nulos.");
            }

            _context.RefreshTokens.Update(oldToken);
            _context.RefreshTokens.Add(newToken);
            await _context.SaveChangesAsync();


            return newToken;
        }

        public async Task RevokeRefreshTokenAsync(RefreshToken refreshToken)
        {
            if (refreshToken == null)
            {
                throw new ArgumentNullException("O token não pode ser nulo.", nameof(refreshToken));
            }
            _context.RefreshTokens.Update(refreshToken);
            await _context.SaveChangesAsync();
        }
    }
}
