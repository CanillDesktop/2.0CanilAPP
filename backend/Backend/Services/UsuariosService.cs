using Backend.Models.Enums;
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

    public async Task<bool> ConfirmarSenhaUsuarioAsync(int usuarioId, string senha)
    {
        var usuario = await _repository.GetByIdAsync(usuarioId);
        if (usuario == null || string.IsNullOrWhiteSpace(senha) || string.IsNullOrEmpty(usuario.HashSenha))
            return false;

        return BCrypt.Net.BCrypt.Verify(senha, usuario.HashSenha);
    }

    public async Task<UsuariosModel?> AtualizarDadosBasicosAsync(int alvoUsuarioId, string primeiroNome, string? sobrenome, string email, PermissoesEnum? novaPermissao = null)
    {
        var usuario = await _repository.GetByIdAsync(alvoUsuarioId);
        if (usuario == null)
            return null;

        var emailTrim = email.Trim();
        if (string.IsNullOrWhiteSpace(emailTrim))
            throw new InvalidOperationException("Email é obrigatório.");

        if (!string.IsNullOrWhiteSpace(sobrenome) && sobrenome.Trim().Length < 2)
            throw new InvalidOperationException("Sobrenome, se informado, deve ter pelo menos 2 caracteres.");

        var existente = await _repository.GetByEmailAsync(emailTrim);
        if (existente != null && existente.Id != alvoUsuarioId)
            throw new InvalidOperationException("Este email já está em uso por outro usuário.");

        usuario.PrimeiroNome = primeiroNome.Trim();
        usuario.Sobrenome = string.IsNullOrWhiteSpace(sobrenome) ? null : sobrenome.Trim();
        usuario.Email = emailTrim;

        if (novaPermissao.HasValue && novaPermissao.Value != usuario.Permissao)
        {
            var adminsAtivos = await _repository.CountAdminsAtivosAsync();
            if (adminsAtivos == 0)
                throw new InvalidOperationException("Não há administrador ativo cadastrado. Não é possível alterar permissões.");

            if (usuario.Permissao == PermissoesEnum.ADMIN && novaPermissao.Value == PermissoesEnum.LEITURA)
            {
                var outrosAdmins = await _repository.CountAdminsAtivosExcetoAsync(alvoUsuarioId);
                if (outrosAdmins < 1)
                    throw new InvalidOperationException("Não é possível rebaixar o último administrador ativo.");
            }

            usuario.Permissao = novaPermissao.Value;
        }

        usuario.DataHoraAtualizacao = DateTime.UtcNow;
        return await _repository.UpdateAsync(usuario);
    }

    public async Task TrocarSenhaAsync(int usuarioId, string senhaAtual, string senhaNova)
    {
        if (string.IsNullOrWhiteSpace(senhaNova) || senhaNova.Length < 6)
            throw new InvalidOperationException("A nova senha deve ter pelo menos 6 caracteres.");
        if (senhaNova.Length > 100)
            throw new InvalidOperationException("A nova senha deve ter no máximo 100 caracteres.");

        var usuario = await _repository.GetByIdAsync(usuarioId);
        if (usuario == null)
            throw new InvalidOperationException("Usuário não encontrado.");

        if (!await ConfirmarSenhaUsuarioAsync(usuarioId, senhaAtual))
            throw new InvalidOperationException("Senha atual incorreta.");

        usuario.HashSenha = BCrypt.Net.BCrypt.HashPassword(senhaNova);
        usuario.DataHoraAtualizacao = DateTime.UtcNow;
        await _repository.UpdateAsync(usuario);
    }

    public async Task<int> ContarUsuariosAsync()
    {
        return await _repository.CountAsync();
    }

    private async Task GarantirNaoEhUltimoAdminAsync(int alvoUsuarioId)
    {
        var usuario = await _repository.GetByIdAsync(alvoUsuarioId);
        if (usuario == null)
            return;

        if (usuario.Permissao != PermissoesEnum.ADMIN || usuario.IsDeleted)
            return;

        if (await _repository.CountAdminsAtivosExcetoAsync(alvoUsuarioId) < 1)
            throw new InvalidOperationException("Não é possível remover ou inativar o último administrador ativo.");
    }
}