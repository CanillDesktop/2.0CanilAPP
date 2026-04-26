using Backend.Models.Usuarios;

namespace Backend.Services.Interfaces;

public interface IUsuariosService : ICRUDService<UsuariosModel>
{
    Task<UsuariosModel?> ValidarUsuarioAsync(string login, string senha);
}