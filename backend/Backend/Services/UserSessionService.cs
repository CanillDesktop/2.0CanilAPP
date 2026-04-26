using Backend.Services.Interfaces;
using System.IdentityModel.Tokens.Jwt;

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
        public string? Name => _accessor.HttpContext?.User?.FindFirst(JwtRegisteredClaimNames.Name)?.Value;
        public string? EditedBy => _accessor.HttpContext?.User?.FindFirst("EditedBy")?.Value;
    }
}
