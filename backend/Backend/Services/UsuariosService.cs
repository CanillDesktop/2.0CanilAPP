using Backend.Exceptions;
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
            throw new RegraDeNegocioInfringidaException("Este email já está em uso por outro usuário");

        var totalUsuarios = await _repository.CountAsync();
        var deveSerAdmin = totalUsuarios < 2;

        if (usuario.Permissao != PermissoesEnum.ADMIN && deveSerAdmin)
        {
            usuario.Permissao = PermissoesEnum.ADMIN;
        }
        usuario.HashSenha = BCrypt.Net.BCrypt.HashPassword(usuario.HashSenha);
        usuario.EditadorPor = $"{usuario.PrimeiroNome} {usuario.Sobrenome} ({usuario.Email})";

        var novoUsuario = await _repository.CreateAsync(usuario);
        return novoUsuario;
    }

    public async Task<UsuariosModel?> AtualizarAsync(int id, UsuariosModel model)
    {

        _ = int.TryParse(_userSessionService.UserId, out int idLogado);

        if (!IsAdmin() && id != idLogado)
        {
            throw new RegraDeNegocioInfringidaException("Somente administradores podem alterar os dados de outro usuário");
        }

        var usuarioExistente = await _repository.GetByIdAsync(id);

        if (usuarioExistente == null)
        {
            throw new ArgumentNullException(null, $"Usuário de id {id} não encontrado");
        }

        var usuarioComEmail = await _repository.GetByEmailAsync(model.Email);
        var emailJaExiste = usuarioComEmail != null && usuarioComEmail.Id != id;
        if (emailJaExiste)
            throw new RegraDeNegocioInfringidaException("Este email já está em uso por outro usuário");

        if (!string.IsNullOrWhiteSpace(model.PrimeiroNome))
        {
            usuarioExistente.PrimeiroNome = model.PrimeiroNome;
        }
        if (!string.IsNullOrWhiteSpace(model.Sobrenome))
        {
            usuarioExistente.Sobrenome = model.Sobrenome;
        }
        if (!string.IsNullOrWhiteSpace(model.Email))
        {
            usuarioExistente.Email = model.Email;
        }
        if (IsAdmin() && model.Permissao != usuarioExistente.Permissao)
        {
            var adminsAtivos = await _repository.CountAsync(u => u.Permissao == PermissoesEnum.ADMIN && !u.IsDeleted);
            if (adminsAtivos == 0)
                throw new RegraDeNegocioInfringidaException("Não há administrador ativo cadastrado. Não é possível alterar permissões");

            if (usuarioExistente.Permissao == PermissoesEnum.ADMIN && model.Permissao == PermissoesEnum.LEITURA)
            {
                var outrosAdmins = await _repository.CountAsync(u => u.Permissao == PermissoesEnum.ADMIN && !u.IsDeleted && u.Id != id);
                if (outrosAdmins < 1)
                    throw new RegraDeNegocioInfringidaException("Não é possível rebaixar o último administrador ativo");
            }

            usuarioExistente.Permissao = model.Permissao;
        }
        if (!string.IsNullOrEmpty(model.HashSenha))
        {
            usuarioExistente.HashSenha = BCrypt.Net.BCrypt.HashPassword(model.HashSenha);
        }

        if (usuarioExistente.IsDeleted != model.IsDeleted)
        {
            await GarantirNaoEhUltimoAdminAsync(usuarioExistente);
        }

        usuarioExistente.IsDeleted = model.IsDeleted;

        usuarioExistente.DataHoraAtualizacao = DateTime.UtcNow;
        usuarioExistente.EditadorPor = _userSessionService.EditedBy ?? string.Empty;

        var result = await _repository.UpdateAsync(usuarioExistente);
        return result;
    }

    public async Task<bool> DeletarAsync(int id, bool hardDelete = false)
    {
        var usuario = await BuscarPorIdAsync(id);

        if (usuario == null) return false;

        await GarantirNaoEhUltimoAdminAsync(usuario);

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

    public async Task TrocarSenhaAsync(int id, string senhaAtual, string novaSenha)
    {
        var usuario = await _repository.GetByIdAsync(id);
        if (usuario == null)
            throw new ArgumentNullException(null, "Usuário não encontrado");

        if (!await ConfirmarSenhaUsuario(usuario, senhaAtual))
            throw new ArgumentException("Senha atual incorreta");

        usuario.HashSenha = BCrypt.Net.BCrypt.HashPassword(novaSenha);

        usuario.DataHoraAtualizacao = DateTime.UtcNow;
        usuario.EditadorPor = _userSessionService.EditedBy ?? string.Empty;

        await _repository.UpdateAsync(usuario);
    }

    public async Task<bool?> InativarAsync(int id, string senha)
    {
        _ = int.TryParse(_userSessionService?.UserId, out int idLogado);

        var usuario = await _repository.GetByIdAsync(idLogado);
        if (usuario == null)
            throw new ArgumentNullException(null, "Usuário não encontrado");

        var usuarioInativar = await _repository.GetByIdAsync(id);
        if (usuarioInativar == null)
            throw new ArgumentNullException(null, "Usuário a inativar não encontrado");

        if (!await ConfirmarSenhaUsuario(usuario, senha))
            throw new ArgumentException("Senha incorreta");

        await GarantirNaoEhUltimoAdminAsync(usuarioInativar);

        usuarioInativar.IsDeleted = true;
        usuarioInativar.DataHoraAtualizacao = DateTime.UtcNow;
        usuarioInativar.EditadorPor = _userSessionService?.EditedBy ?? string.Empty;

        return (await _repository.UpdateAsync(usuarioInativar))?.IsDeleted;
    }


    private async Task GarantirNaoEhUltimoAdminAsync(UsuariosModel usuario)
    {
        if (usuario.Permissao != PermissoesEnum.ADMIN)
            return;

        if (await _repository.CountAsync(u => u.Permissao == PermissoesEnum.ADMIN && !u.IsDeleted) == 1)
            throw new InvalidOperationException("Não é possível remover ou inativar o último administrador ativo");
    }

    private bool IsAdmin()
    {
        return _userSessionService.Role == "ADMIN";
    }

    private static async Task<bool> ConfirmarSenhaUsuario(UsuariosModel usuario, string senha)
    {
        if (usuario == null || string.IsNullOrWhiteSpace(senha) || string.IsNullOrEmpty(usuario.HashSenha))
            return false;

        return BCrypt.Net.BCrypt.Verify(senha, usuario.HashSenha);
    }
}