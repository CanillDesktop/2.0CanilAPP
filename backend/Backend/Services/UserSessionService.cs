using Backend.Services.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace Backend.Services
{
    public class UserSessionService : IUserSessionService
    {
        private readonly IHttpContextAccessor _accessor;

        public UserSessionService(IHttpContextAccessor accessor)
        {
            _accessor = accessor;
        }
        public string? UserId => _accessor.HttpContext?.User?.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        public string? Email => _accessor.HttpContext?.User?.FindFirst(JwtRegisteredClaimNames.Email)?.Value;
        public string? Name => _accessor.HttpContext?.User?.FindFirst(ClaimTypes.Name)?.Value;
        public string? EditedBy => _accessor.HttpContext?.User?.FindFirst("EditedBy")?.Value;
        public string? Role => _accessor.HttpContext?.User?.FindFirst(ClaimTypes.Role)?.Value;
    }
}
