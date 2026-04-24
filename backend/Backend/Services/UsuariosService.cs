using Backend.Models.Usuarios;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;

namespace Backend.Services;

public class UsuariosService : IUsuariosService
{
    private readonly IUsuariosRepository<UsuariosModel> _repository;

    public UsuariosService(IUsuariosRepository<UsuariosModel> repository)
    {
        _repository = repository;
    }

    public async Task<UsuariosModel?> CriarAsync(UsuariosModel usuario)
    {
        if (await _repository.GetByEmailAsync(usuario.Email) != null)
            throw new InvalidOperationException("Usuário já existe");

        usuario.HashSenha = BCrypt.Net.BCrypt.HashPassword(usuario.HashSenha);

        var novoUsuario = await _repository.CreateAsync(usuario);
        return novoUsuario;
    }

    public async Task<UsuariosModel?> AtualizarAsync(UsuariosModel usuario)
    {
        try
        {
            if (!string.IsNullOrEmpty(usuario.HashSenha))
            {
                usuario.HashSenha = BCrypt.Net.BCrypt.HashPassword(usuario.HashSenha);
            }

            var atualizado = await _repository.UpdateAsync(usuario);
            return atualizado;
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException("Erro ao atualizar usuário", ex);
        }
    }

    public async Task<bool> DeletarAsync(int id)
    {
        return await _repository.DeleteAsync(id);
    }

    public async Task<IEnumerable<UsuariosModel>> BuscarTodosAsync()
    {
        return await _repository.GetAsync();
    }

    public async Task<UsuariosModel?> BuscarPorIdAsync(int id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<UsuariosModel?> ValidarUsuarioAsync(string login, string senha)
    {
        var usuario = await _repository.GetByEmailAsync(login);

        if (usuario == null)
            return null;

        if (string.IsNullOrEmpty(usuario.HashSenha))
            return null;

        var senhaValida = BCrypt.Net.BCrypt.Verify(senha, usuario.HashSenha);

        return senhaValida ? usuario : null;
    }
}