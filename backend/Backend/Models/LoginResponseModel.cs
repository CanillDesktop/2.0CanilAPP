using Backend.DTOs;

namespace Backend.Models
{
    public class LoginResponseModel
    {
        public TokenResponse? Token { get; set; }
        public UsuarioResponseDTO? Usuario { get; set; }

    }
}
