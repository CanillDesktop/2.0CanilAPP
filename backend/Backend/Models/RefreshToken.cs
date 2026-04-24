using Backend.Models.Usuarios;

namespace Backend.Models
{
    public class RefreshToken
    {
        public RefreshToken() { }
        public RefreshToken(string tokenHash, DateTime expiresAt, int userId)
        {
            TokenHash = tokenHash;
            CreatedAt = DateTime.UtcNow;
            ExpiresAt = expiresAt;
            UserId = userId;
        }

        public int Id { get; set; }
        public string TokenHash { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        public DateTime? RevokedAt { get; set; }
        public string? ReplacedByTokenHash { get; set; }

        public int UserId { get; set; }
        public UsuariosModel? User { get; set; } = null!;

        public bool IsActive => RevokedAt == null && ExpiresAt > DateTime.UtcNow;
    }
}
