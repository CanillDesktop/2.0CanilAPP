using Backend.Models.Usuarios;

namespace Backend.Services.Interfaces;

public interface IUsuariosService : ICRUDService<UsuariosModel>
{
    Task<UsuariosModel?> ValidarUsuarioAsync(string login, string senha);
    Task TrocarSenhaAsync(int id, string senhaAtual, string novaSenha);
    Task<bool?> InativarAsync(int id, string senha);
}