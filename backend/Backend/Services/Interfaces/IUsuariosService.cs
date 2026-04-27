using Backend.Models.Enums;
using Backend.Models.Usuarios;

namespace Backend.Services.Interfaces;

public interface IUsuariosService
{
    Task<IEnumerable<UsuariosModel>> BuscarTodosAsync();
    Task<UsuariosModel?> BuscarPorIdAsync(int id);
    Task<UsuariosModel?> CriarAsync(UsuariosModel obj);
    Task<UsuariosModel?> AtualizarAsync(UsuariosModel obj);
    Task<bool> DeletarAsync(int id);
    Task<UsuariosModel?> ValidarUsuarioAsync(string login, string senha);
    Task<bool> ConfirmarSenhaUsuarioAsync(int usuarioId, string senha);
    Task<UsuariosModel?> AtualizarDadosBasicosAsync(int alvoUsuarioId, string primeiroNome, string? sobrenome, string email, PermissoesEnum? novaPermissao = null);
    Task TrocarSenhaAsync(int usuarioId, string senhaAtual, string senhaNova);
    Task<bool> InativarAsync(int id);
    Task<int> ContarUsuariosAsync();
}