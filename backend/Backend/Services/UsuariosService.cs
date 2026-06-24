using Backend.Context;
using Backend.DTOs.Common;
using Backend.DTOs.Estoque;
using Backend.DTOs.Usuario;
using Backend.Exceptions;
using Backend.Models.Enums;
using Backend.Models.Estoque;
using Backend.Models.Usuarios;
using Backend.Pagination;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class UsuariosService : IUsuariosService
{
    private readonly IUsuariosRepository _repository;
    private readonly IUserSessionService _userSessionService;
    private readonly IRefreshTokenService _refreshTokenService;
    private readonly CanilAppDbContext _context;

    public UsuariosService(
        IUsuariosRepository repository,
        IUserSessionService userSessionService,
        IRefreshTokenService refreshTokenService,
        CanilAppDbContext context)
    {
        _repository = repository;
        _userSessionService = userSessionService;
        _refreshTokenService = refreshTokenService;
        _context = context;
    }

    public Task<IEnumerable<UsuariosModel>> BuscarTodosAsync()
        => throw new NotSupportedException("Use ListarPaginadoAsync para listagem de usuários.");

    public Task<UsuariosModel?> BuscarPorIdAsync(int id) => _repository.GetByIdAsync(id);

    public async Task<PagedResultDto<UsuarioResponseDTO>> ListarPaginadoAsync(
        UsuarioListagemParameters parameters,
        CancellationToken cancellationToken = default)
    {
        var statuses = ResolverStatusesListagem(parameters.NormalizedStatus);
        var (items, total) = await _repository.ListarPaginadoAsync(
            statuses,
            parameters.Busca,
            parameters.NormalizedPageNumber,
            parameters.PageSize,
            cancellationToken);

        var dtos = items.Select(u => (UsuarioResponseDTO)u).ToList();
        return PagedResultFactory.Create(dtos, total, parameters.NormalizedPageNumber, parameters.PageSize);
    }

    public async Task<UsuariosModel?> CriarAsync(UsuariosModel usuario)
    {
        if (await _repository.GetByEmailAsync(usuario.Email) is { Status: not StatusUsuario.Excluido })
            throw new RegraDeNegocioInfringidaException("Este email já está em uso por outro usuário");

        var totalUsuarios = await _repository.CountAsync(u => u.Status != StatusUsuario.Excluido);
        var deveSerAdmin = totalUsuarios < 2;

        if (usuario.Permissao != PermissoesEnum.ADMIN && deveSerAdmin)
            usuario.Permissao = PermissoesEnum.ADMIN;

        usuario.HashSenha = BCrypt.Net.BCrypt.HashPassword(usuario.HashSenha);
        usuario.Status = StatusUsuario.Ativo;
        usuario.SincronizarIsDeleted();
        usuario.EditadorPor = $"{usuario.PrimeiroNome} {usuario.Sobrenome} ({usuario.Email})";
        usuario.TokenVersion = 1;

        return await _repository.CreateAsync(usuario);
    }

    public async Task<UsuariosModel?> CriarAsync(UsuarioCriacaoComConfirmacaoRequestDTO dto)
    {
        UsuariosModel usuario = dto;
        var criado = await CriarAsync(usuario);
        if (criado is null)
            return null;

        await SincronizarUnidadesEstoqueAsync(criado.Id, dto.UnidadesEstoque, criado.Permissao);
        return criado;
    }

    public async Task<UsuariosModel?> AtualizarAsync(int id, AtualizarUsuarioRequestDTO dto)
    {
        UsuariosModel model = dto;
        var atualizado = await AtualizarAsync(id, model);

        if (atualizado is not null && IsAdmin() && dto.UnidadesEstoque is not null)
            await SincronizarUnidadesEstoqueAsync(id, dto.UnidadesEstoque, atualizado.Permissao);

        return atualizado;
    }

    public async Task<IReadOnlyList<UsuarioUnidadeEstoqueDTO>> ObterUnidadesEstoqueAsync(
        int idUsuario,
        CancellationToken cancellationToken = default)
    {
        if (!IsAdmin() && int.TryParse(_userSessionService.UserId, out var logado) && logado != idUsuario)
            throw new AcessoNegadoException("Sem permissão para consultar unidades de outro usuário.");

        return await (
            from v in _context.UsuariosUnidadesEstoque.AsNoTracking()
            join u in _context.UnidadesEstoque.AsNoTracking() on v.IdUnidadeEstoque equals u.Id
            where v.IdUsuario == idUsuario && u.Ativa && !u.IsDeleted
            select new UsuarioUnidadeEstoqueDTO
            {
                IdUnidadeEstoque = v.IdUnidadeEstoque,
                NomeUnidade = u.Nome,
                SiglaUnidade = u.Sigla,
                PodeConsultar = v.PodeConsultar,
                PodeEntrada = v.PodeEntrada,
                PodeSaida = v.PodeSaida,
                PodeTransferirEnviar = v.PodeTransferirEnviar,
                PodeTransferirReceber = v.PodeTransferirReceber,
            }).ToListAsync(cancellationToken);
    }

    private async Task SincronizarUnidadesEstoqueAsync(
        int idUsuario,
        IReadOnlyList<UsuarioUnidadeEstoqueAtribuicaoDTO>? unidades,
        PermissoesEnum permissao)
    {
        var atribuicoes = unidades is { Count: > 0 }
            ? unidades
            : ObterAtribuicaoPadrao(permissao);

        var existentes = await _context.UsuariosUnidadesEstoque
            .Where(v => v.IdUsuario == idUsuario)
            .ToListAsync();

        _context.UsuariosUnidadesEstoque.RemoveRange(existentes);

        foreach (var a in atribuicoes)
        {
            _context.UsuariosUnidadesEstoque.Add(new UsuarioUnidadeEstoqueModel
            {
                IdUsuario = idUsuario,
                IdUnidadeEstoque = a.IdUnidadeEstoque,
                PodeConsultar = a.PodeConsultar,
                PodeEntrada = a.PodeEntrada,
                PodeSaida = a.PodeSaida,
                PodeTransferirEnviar = a.PodeTransferirEnviar,
                PodeTransferirReceber = a.PodeTransferirReceber,
            });
        }

        await _context.SaveChangesAsync();
    }

    private static List<UsuarioUnidadeEstoqueAtribuicaoDTO> ObterAtribuicaoPadrao(PermissoesEnum permissao)
    {
        if (permissao == PermissoesEnum.ADMIN)
        {
            return
            [
                new() { IdUnidadeEstoque = UnidadeEstoqueIds.Secretaria, PodeConsultar = true, PodeEntrada = true, PodeSaida = true, PodeTransferirEnviar = true, PodeTransferirReceber = true },
                new() { IdUnidadeEstoque = UnidadeEstoqueIds.Canil, PodeConsultar = true, PodeEntrada = true, PodeSaida = true, PodeTransferirEnviar = true, PodeTransferirReceber = true },
            ];
        }

        return
        [
            new() { IdUnidadeEstoque = UnidadeEstoqueIds.Secretaria, PodeConsultar = true, PodeEntrada = true, PodeSaida = true, PodeTransferirEnviar = true, PodeTransferirReceber = false },
        ];
    }

    public async Task<UsuariosModel?> AtualizarAsync(int id, UsuariosModel model)
    {
        _ = int.TryParse(_userSessionService.UserId, out int idLogado);

        if (!IsAdmin() && id != idLogado)
            throw new RegraDeNegocioInfringidaException("Somente administradores podem alterar os dados de outro usuário");

        var usuarioExistente = await _repository.GetByIdGestaoAsync(id)
            ?? await _repository.GetByIdAsync(id);

        if (usuarioExistente == null)
            throw new ArgumentNullException(null, $"Usuário de id {id} não encontrado");

        if (usuarioExistente.Status == StatusUsuario.Excluido)
            throw new RegraDeNegocioInfringidaException("Não é possível editar um usuário excluído.");

        var usuarioComEmail = await _repository.GetByEmailAsync(model.Email);
        if (usuarioComEmail != null && usuarioComEmail.Id != id && usuarioComEmail.Status != StatusUsuario.Excluido)
            throw new RegraDeNegocioInfringidaException("Este email já está em uso por outro usuário");

        if (!string.IsNullOrWhiteSpace(model.PrimeiroNome))
            usuarioExistente.PrimeiroNome = model.PrimeiroNome;

        if (!string.IsNullOrWhiteSpace(model.Sobrenome))
            usuarioExistente.Sobrenome = model.Sobrenome;

        if (!string.IsNullOrWhiteSpace(model.Email))
            usuarioExistente.Email = model.Email;

        if (IsAdmin() && model.Permissao != usuarioExistente.Permissao)
        {
            var adminsAtivos = await _repository.CountAsync(u =>
                u.Permissao == PermissoesEnum.ADMIN && u.Status == StatusUsuario.Ativo);

            if (adminsAtivos == 0)
                throw new RegraDeNegocioInfringidaException("Não há administrador ativo cadastrado. Não é possível alterar permissões");

            if (usuarioExistente.Permissao == PermissoesEnum.ADMIN
                && model.Permissao == PermissoesEnum.LEITURA)
            {
                var outrosAdmins = await _repository.CountAsync(u =>
                    u.Permissao == PermissoesEnum.ADMIN
                    && u.Status == StatusUsuario.Ativo
                    && u.Id != id);

                if (outrosAdmins < 1)
                    throw new RegraDeNegocioInfringidaException("Não é possível rebaixar o último administrador ativo");
            }

            usuarioExistente.Permissao = model.Permissao;
        }

        if (!string.IsNullOrEmpty(model.HashSenha))
            usuarioExistente.HashSenha = BCrypt.Net.BCrypt.HashPassword(model.HashSenha);

        usuarioExistente.DataHoraAtualizacao = DateTime.UtcNow;
        usuarioExistente.EditadorPor = Executor;

        return await _repository.UpdateAsync(usuarioExistente);
    }

    async Task<bool> ICRUDService<UsuariosModel>.DeletarAsync(int id, bool hardDelete)
        => await DeletarAsync(id, string.Empty, hardDelete);

    public async Task<bool> DeletarAsync(int id, string senhaConfirmacao, bool hardDelete = false)
    {
        GarantirNaoEhAutoAcao(id);

        if (hardDelete)
        {
            await ConfirmarSenhaAdminAsync(senhaConfirmacao);
            var excluido = await _repository.GetByIdExcluidoAsync(id);
            if (excluido == null)
                return false;

            await _refreshTokenService.RevokeAllTokensForUserAsync(id);
            return await _repository.DeleteAsync(excluido, hardDelete: true);
        }

        await ConfirmarSenhaAdminAsync(senhaConfirmacao);

        var usuario = await _repository.GetByIdGestaoAsync(id);
        if (usuario == null)
            return false;

        if (usuario.Status == StatusUsuario.Excluido)
            return false;

        await GarantirNaoEhUltimoAdminAsync(usuario);

        var agora = DateTime.UtcNow;
        usuario.Status = StatusUsuario.Excluido;
        usuario.DeletedAt = agora;
        usuario.DeletedBy = Executor;
        usuario.DataHoraAtualizacao = agora;
        usuario.EditadorPor = Executor;
        usuario.SincronizarIsDeleted();
        await InvalidarSessoesAsync(usuario);

        await _repository.UpdateAsync(usuario);
        return true;
    }

    public async Task<UsuariosModel?> ValidarUsuarioAsync(string login, string senha)
    {
        var usuario = await _repository.GetByEmailAsync(login);

        if (usuario == null)
            return null;

        if (usuario.Status == StatusUsuario.Inativo)
            throw new AcessoNegadoException("Usuário inativo. Favor contatar o suporte/administradores.");

        if (usuario.Status == StatusUsuario.Excluido)
            throw new AcessoNegadoException("Usuário não encontrado ou indisponível.");

        if (string.IsNullOrEmpty(usuario.HashSenha))
            return null;

        return BCrypt.Net.BCrypt.Verify(senha, usuario.HashSenha) ? usuario : null;
    }

    public async Task TrocarSenhaAsync(int id, string senhaAtual, string novaSenha)
    {
        var usuario = await _repository.GetByIdAsync(id)
            ?? await _repository.GetByIdGestaoAsync(id);

        if (usuario == null)
            throw new ArgumentNullException(null, "Usuário não encontrado");

        if (usuario.Status != StatusUsuario.Ativo)
            throw new AcessoNegadoException("Conta inativa ou excluída. Não é possível alterar a senha.");

        if (!await ConfirmarSenhaUsuario(usuario, senhaAtual))
            throw new ArgumentException("Senha atual incorreta");

        usuario.HashSenha = BCrypt.Net.BCrypt.HashPassword(novaSenha);
        usuario.DataHoraAtualizacao = DateTime.UtcNow;
        usuario.EditadorPor = Executor;
        await InvalidarSessoesAsync(usuario);
        await _repository.UpdateAsync(usuario);
    }

    public async Task<bool?> InativarAsync(int id, string senha)
    {
        GarantirNaoEhAutoAcao(id);
        await ConfirmarSenhaAdminAsync(senha);

        var usuarioInativar = await _repository.GetByIdAsync(id);
        if (usuarioInativar == null)
            throw new ArgumentNullException(null, "Usuário a inativar não encontrado");

        await GarantirNaoEhUltimoAdminAsync(usuarioInativar);

        var agora = DateTime.UtcNow;
        usuarioInativar.Status = StatusUsuario.Inativo;
        usuarioInativar.InactivatedAt = agora;
        usuarioInativar.InactivatedBy = Executor;
        usuarioInativar.DataHoraAtualizacao = agora;
        usuarioInativar.EditadorPor = Executor;
        usuarioInativar.SincronizarIsDeleted();
        await InvalidarSessoesAsync(usuarioInativar);

        return (await _repository.UpdateAsync(usuarioInativar))?.Status == StatusUsuario.Inativo;
    }

    public async Task<bool?> ReativarAsync(int id, string senha)
    {
        await ConfirmarSenhaAdminAsync(senha);

        var usuario = await _repository.GetByIdGestaoAsync(id);
        if (usuario == null)
            throw new ArgumentNullException(null, "Usuário a reativar não encontrado");

        if (usuario.Status != StatusUsuario.Inativo)
            throw new RegraDeNegocioInfringidaException("Somente usuários inativos podem ser reativados.");

        var agora = DateTime.UtcNow;
        usuario.Status = StatusUsuario.Ativo;
        usuario.ReactivatedAt = agora;
        usuario.ReactivatedBy = Executor;
        usuario.InactivatedAt = null;
        usuario.InactivatedBy = null;
        usuario.DataHoraAtualizacao = agora;
        usuario.EditadorPor = Executor;
        usuario.SincronizarIsDeleted();
        await InvalidarSessoesAsync(usuario);

        return (await _repository.UpdateAsync(usuario))?.Status == StatusUsuario.Ativo;
    }

    public Task<IReadOnlyList<UsuarioResumoFiltroDTO>> ListarResumoParaFiltrosHistoricoRetiradasAsync(
        CancellationToken cancellationToken = default)
        => _repository.ListarResumoParaFiltrosAsync(cancellationToken);

    private async Task GarantirNaoEhUltimoAdminAsync(UsuariosModel usuario)
    {
        if (usuario.Permissao != PermissoesEnum.ADMIN)
            return;

        if (await _repository.CountAsync(u =>
                u.Permissao == PermissoesEnum.ADMIN && u.Status == StatusUsuario.Ativo) == 1)
            throw new ConflitoDeNegocioException("Não é permitido remover o último administrador ativo do sistema.");
    }

    private void GarantirNaoEhAutoAcao(int idAlvo)
    {
        _ = int.TryParse(_userSessionService.UserId, out int idLogado);
        if (idLogado != 0 && idAlvo == idLogado)
            throw new ConflitoDeNegocioException("Você não pode executar esta ação na sua própria conta.");
    }

    private async Task ConfirmarSenhaAdminAsync(string senha)
    {
        if (string.IsNullOrWhiteSpace(senha))
            throw new ArgumentException("Senha incorreta");

        _ = int.TryParse(_userSessionService.UserId, out int idLogado);
        var admin = await _repository.GetByIdAsync(idLogado);
        if (admin == null)
            throw new ArgumentNullException(null, "Usuário administrador não encontrado");

        if (!await ConfirmarSenhaUsuario(admin, senha))
            throw new ArgumentException("Senha incorreta");
    }

    private async Task InvalidarSessoesAsync(UsuariosModel usuario)
    {
        usuario.TokenVersion++;
        await _refreshTokenService.RevokeAllTokensForUserAsync(usuario.Id);
    }

    private string Executor => _userSessionService.EditedBy ?? string.Empty;

    private bool IsAdmin() => _userSessionService.Role == "ADMIN";

    private static Task<bool> ConfirmarSenhaUsuario(UsuariosModel usuario, string senha)
    {
        if (usuario == null || string.IsNullOrWhiteSpace(senha) || string.IsNullOrEmpty(usuario.HashSenha))
            return Task.FromResult(false);

        return Task.FromResult(BCrypt.Net.BCrypt.Verify(senha, usuario.HashSenha));
    }

    private static StatusUsuario[] ResolverStatusesListagem(string status)
    {
        return status switch
        {
            "inativo" or "inativos" => [StatusUsuario.Inativo],
            "excluido" or "excluidos" => [StatusUsuario.Excluido],
            "todos" => [StatusUsuario.Ativo, StatusUsuario.Inativo],
            _ => [StatusUsuario.Ativo]
        };
    }
}
