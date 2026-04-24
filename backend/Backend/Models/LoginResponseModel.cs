using Backend.DTOs.Usuario;

namespace Backend.Models
{
    public class LoginResponseModel
    {
        public TokenResponse? TokenResponse { get; set; }
        public UsuarioResponseDTO? Usuario { get; set; }

    }
}
