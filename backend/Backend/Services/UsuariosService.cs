using Backend.Models.Usuarios;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;

namespace Backend.Services;

public class UsuariosService : IUsuariosService
{
    private readonly IUsuariosRepository _repository;
    private readonly IUserSessionService _userSessionService;

    public UsuariosService(IUsuariosRepository repository, IUserSessionService userSessionService)
    {
        _repository = repository;
        _userSessionService = userSessionService;
    }

    public async Task<IEnumerable<UsuariosModel>> BuscarTodosAsync() => await _repository.GetAsync();

    public async Task<UsuariosModel?> BuscarPorIdAsync(int id) => await _repository.GetByIdAsync(id);

    public async Task<UsuariosModel?> CriarAsync(UsuariosModel usuario)
    {
        if (await _repository.GetByEmailAsync(usuario.Email) != null)
            throw new InvalidOperationException("Usuário já existe");

        usuario.HashSenha = BCrypt.Net.BCrypt.HashPassword(usuario.HashSenha);
        usuario.EditadorPor = $"{usuario.PrimeiroNome} {usuario.Sobrenome} ({usuario.Email})";

        var novoUsuario = await _repository.CreateAsync(usuario);
        return novoUsuario;
    }

    public async Task<UsuariosModel?> AtualizarAsync(int id, UsuariosModel model)
    {
        try
        {
            var usuarioExistente = await _repository.GetByIdAsync(id);

            if (usuarioExistente == null)
            {
                throw new ArgumentNullException(null, $"Usuário de id {id} não encontrado");
            }

            usuarioExistente.PrimeiroNome = model.PrimeiroNome;
            usuarioExistente.Sobrenome = model.Sobrenome;
            usuarioExistente.Permissao = model.Permissao;
            usuarioExistente.Email = model.Email;
            usuarioExistente.IsDeleted = model.IsDeleted;

            if (!string.IsNullOrEmpty(model.HashSenha))
            {
                usuarioExistente.HashSenha = BCrypt.Net.BCrypt.HashPassword(model.HashSenha);
            }

            usuarioExistente.DataHoraAtualizacao = DateTime.UtcNow;
            usuarioExistente.EditadorPor = _userSessionService.EditedBy ?? string.Empty;

            var result = await _repository.UpdateAsync(usuarioExistente);
            return result;
        }
        catch (ArgumentNullException ex)
        {
            throw new ArgumentNullException(null, ex.Message);
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException("Erro ao atualizar usuário", ex);
        }
    }

    public async Task<bool> DeletarAsync(int id, bool hardDelete = false)
    {
        var usuario = await BuscarPorIdAsync(id);

        if (usuario == null) return false;

        usuario.IsDeleted = true;
        usuario.DataHoraAtualizacao = DateTime.UtcNow;

        return await _repository.DeleteAsync(usuario, hardDelete);
    }

    public async Task<UsuariosModel?> ValidarUsuarioAsync(string login, string senha)
    {
        var usuario = await _repository.GetByEmailAsync(login);

        if (usuario == null)
            return null;

        if (usuario.IsDeleted)
        {
            throw new UnauthorizedAccessException("Usuário inativo. Favor contatar o suporte/administradores");
        }

        if (string.IsNullOrEmpty(usuario.HashSenha))
            return null;

        var senhaValida = BCrypt.Net.BCrypt.Verify(senha, usuario.HashSenha);

        return senhaValida ? usuario : null;
    }
}