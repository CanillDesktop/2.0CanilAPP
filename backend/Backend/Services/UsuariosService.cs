using Backend.Context;
using Backend.Data;
using Backend.DTOs.Common;
using Backend.DTOs.Estoque;
using Backend.DTOs.Usuario;
using Backend.Exceptions;
using Backend.Models.Cargos;
using Backend.Models.Enums;
using Backend.Models.Estoque;
using Backend.Models.Permissoes;
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
    private readonly IPermissaoAuthorizationService _authorization;

    public UsuariosService(
        IUsuariosRepository repository,
        IUserSessionService userSessionService,
        IRefreshTokenService refreshTokenService,
        CanilAppDbContext context,
        IPermissaoAuthorizationService authorization)
    {
        _repository = repository;
        _userSessionService = userSessionService;
        _refreshTokenService = refreshTokenService;
        _context = context;
        _authorization = authorization;
    }

    public Task<IEnumerable<UsuariosModel>> BuscarTodosAsync()
        => throw new NotSupportedException("Use ListarPaginadoAsync para listagem de usuários.");

    public Task<UsuariosModel?> BuscarPorIdAsync(int id) => _repository.GetByIdAsync(id);

    public async Task<PagedResultDto<UsuarioResponseDTO>> ListarPaginadoAsync(
        UsuarioListagemParameters parameters,
        CancellationToken cancellationToken = default)
    {
        await _authorization.GarantirPermissaoAsync(PermissaoCodigos.UsuariosListar, cancellationToken: cancellationToken);

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

        if (deveSerAdmin)
            usuario.IdCargo = CargoModel.IdAdministrador;

        if (usuario.IdCargo <= 0)
            usuario.IdCargo = CargoModel.IdGrupoPadrao;

        await GarantirCargoExisteAsync(usuario.IdCargo);

        if (await EhCargoAdministradorAsync(usuario.IdCargo))
            usuario.PodeGerenciarUnidadesMedida = true;

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

        await SincronizarUnidadesEstoqueAsync(criado.Id, dto.UnidadesEstoque, criado.IdCargo);
        await PermissaoSeed.SincronizarAtribuicoesUsuarioAsync(_context, criado.Id);
        return criado;
    }

    public async Task<UsuariosModel?> AtualizarAsync(int id, AtualizarUsuarioRequestDTO dto)
    {
        var usuarioExistente = await _repository.GetByIdGestaoAsync(id)
            ?? await _repository.GetByIdAsync(id)
            ?? throw new ArgumentNullException(null, $"Usuário de id {id} não encontrado");

        _ = int.TryParse(_userSessionService.UserId, out var idLogado);
        var editandoOutro = idLogado != 0 && id != idLogado;
        var podeGerenciarPermissoes = await UsuarioPermissaoAtribuicaoService.PossuiPermissaoGerenciarUsuariosAsync(
            _authorization,
            cancellationToken: default);

        if (editandoOutro && dto.IdCargo is int idCargoNovo && idCargoNovo != usuarioExistente.IdCargo)
        {
            if (!podeGerenciarPermissoes)
                throw new AcessoNegadoException("Sem permissão para alterar o cargo de outro usuário.");

            await GarantirCargoExisteAsync(idCargoNovo);

            if (await ContarUsuariosAdministradorAtivosAsync() == 0)
                throw new RegraDeNegocioInfringidaException("Não há administrador ativo cadastrado. Não é possível alterar cargos");

            if (await EhCargoAdministradorAsync(usuarioExistente.IdCargo) && !await EhCargoAdministradorAsync(idCargoNovo))
            {
                if (await ContarUsuariosAdministradorAtivosAsync(usuarioExistente.Id) < 1)
                    throw new RegraDeNegocioInfringidaException("Não é possível rebaixar o último administrador ativo");
            }

            usuarioExistente.IdCargo = idCargoNovo;
            if (await EhCargoAdministradorAsync(usuarioExistente.IdCargo))
                usuarioExistente.PodeGerenciarUnidadesMedida = true;

            await InvalidarSessoesAsync(usuarioExistente);
            await _repository.UpdateAsync(usuarioExistente);
            await PermissaoSeed.SincronizarAtribuicoesUsuarioAsync(_context, id);
        }

        UsuariosModel model = dto;
        var atualizado = await AtualizarAsync(id, model);

        if (atualizado is not null && editandoOutro && podeGerenciarPermissoes)
        {
            if (dto.PodeGerenciarUnidadesMedida is bool podeGerenciar)
            {
                // Admin sempre pode gerenciar o catálogo; a flag só restringe usuários comuns.
                atualizado.PodeGerenciarUnidadesMedida =
                    await EhCargoAdministradorAsync(atualizado.IdCargo) || podeGerenciar;
                atualizado.DataHoraAtualizacao = DateTime.UtcNow;
                atualizado.EditadorPor = Executor;
                await _repository.UpdateAsync(atualizado);
            }

            if (dto.UnidadesEstoque is not null)
                await SincronizarUnidadesEstoqueAsync(id, dto.UnidadesEstoque, atualizado.IdCargo);

            await PermissaoSeed.SincronizarAtribuicoesUsuarioAsync(_context, id);
        }

        if (dto.IdCargo is not null)
            await PermissaoSeed.SincronizarAtribuicoesUsuarioAsync(_context, id);

        return atualizado;
    }

    public async Task<IReadOnlyList<UsuarioUnidadeEstoqueDTO>> ObterUnidadesEstoqueAsync(
        int idUsuario,
        CancellationToken cancellationToken = default)
    {
        _ = int.TryParse(_userSessionService.UserId, out var idLogado);
        if (idLogado != 0 && idUsuario != idLogado &&
            !await UsuarioPermissaoAtribuicaoService.PossuiPermissaoGerenciarUsuariosAsync(_authorization, cancellationToken))
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
        int idCargo)
    {
        var atribuicoes = unidades is { Count: > 0 }
            ? unidades
            : ObterAtribuicaoPadrao(idCargo);

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
        await PermissaoSeed.SincronizarAtribuicoesUsuarioAsync(_context, idUsuario);
    }

    private static List<UsuarioUnidadeEstoqueAtribuicaoDTO> ObterAtribuicaoPadrao(int idCargo)
    {
        if (idCargo == CargoModel.IdAdministrador)
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

        if (id != idLogado)
        {
            await _authorization.GarantirPermissaoAsync(PermissaoCodigos.UsuariosEditar);

            if (!string.IsNullOrEmpty(model.HashSenha))
                await _authorization.GarantirPermissaoAsync(PermissaoCodigos.UsuariosSenhaAlterar);
        }

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

        if (!string.IsNullOrEmpty(model.HashSenha))
            usuarioExistente.HashSenha = BCrypt.Net.BCrypt.HashPassword(model.HashSenha);

        usuarioExistente.DataHoraAtualizacao = DateTime.UtcNow;
        usuarioExistente.EditadorPor = Executor;

        return await _repository.UpdateAsync(usuarioExistente);
    }

    public async Task<bool> UsuarioPodeGerenciarUnidadesMedidaAsync(
        int idUsuario,
        CancellationToken cancellationToken = default)
    {
        var usuario = await _repository.GetByIdAsync(idUsuario)
            ?? await _repository.GetByIdGestaoAsync(idUsuario);
        if (usuario is null || usuario.Status != StatusUsuario.Ativo)
            return false;

        if (await _authorization.PossuiPermissaoAsync(PermissaoCodigos.UnidadesMedidaGerenciar, idUsuario: idUsuario, cancellationToken: cancellationToken))
            return true;

        return usuario.PodeGerenciarUnidadesMedida;
    }

    async Task<bool> ICRUDService<UsuariosModel>.DeletarAsync(int id, bool hardDelete)
        => await DeletarAsync(id, string.Empty, hardDelete);

    public async Task<bool> DeletarAsync(int id, string senhaConfirmacao, bool hardDelete = false)
    {
        await _authorization.GarantirPermissaoAsync(PermissaoCodigos.UsuariosExcluir);
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
        _ = int.TryParse(_userSessionService.UserId, out int idLogado);

        if (idLogado != 0 && id != idLogado)
            throw new RegraDeNegocioInfringidaException(
                "Para alterar a senha de outro usuário, use a opção de redefinição de senha.");

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

    public async Task<UsuarioSenhaResumoDTO> ObterResumoSenhaAsync(
        int idUsuario,
        CancellationToken cancellationToken = default)
    {
        _ = int.TryParse(_userSessionService.UserId, out int idLogado);

        if (idLogado == 0 || idUsuario != idLogado)
            await _authorization.GarantirPermissaoAsync(
                PermissaoCodigos.UsuariosSenhaVisualizar,
                cancellationToken: cancellationToken);

        var usuario = await _repository.GetByIdGestaoAsync(idUsuario)
            ?? await _repository.GetByIdAsync(idUsuario)
            ?? throw new ArgumentNullException(null, "Usuário não encontrado");

        return new UsuarioSenhaResumoDTO
        {
            IdUsuario = usuario.Id,
            PossuiSenhaDefinida = !string.IsNullOrEmpty(usuario.HashSenha),
            SenhaRecuperavel = false,
        };
    }

    public async Task RedefinirSenhaOutroUsuarioAsync(
        int idUsuario,
        string novaSenha,
        string senhaConfirmacao,
        CancellationToken cancellationToken = default)
    {
        GarantirNaoEhAutoAcao(idUsuario);
        await _authorization.GarantirPermissaoAsync(
            PermissaoCodigos.UsuariosSenhaAlterar,
            cancellationToken: cancellationToken);
        await ConfirmarSenhaAdminAsync(senhaConfirmacao);

        if (string.IsNullOrWhiteSpace(novaSenha))
            throw new ArgumentException("Nova senha é obrigatória.");

        var usuario = await _repository.GetByIdGestaoAsync(idUsuario)
            ?? await _repository.GetByIdAsync(idUsuario)
            ?? throw new ArgumentNullException(null, "Usuário não encontrado");

        if (usuario.Status == StatusUsuario.Excluido)
            throw new RegraDeNegocioInfringidaException("Não é possível alterar a senha de um usuário excluído.");

        usuario.HashSenha = BCrypt.Net.BCrypt.HashPassword(novaSenha);
        usuario.DataHoraAtualizacao = DateTime.UtcNow;
        usuario.EditadorPor = Executor;
        await InvalidarSessoesAsync(usuario);
        await _repository.UpdateAsync(usuario);
    }

    public async Task<bool?> InativarAsync(int id, string senha)
    {
        await _authorization.GarantirPermissaoAsync(PermissaoCodigos.UsuariosInativar);
        GarantirNaoEhAutoAcao(id);
        await ConfirmarSenhaAdminAsync(senha);

        var usuarioInativar = await _repository.GetByIdGestaoAsync(id);
        if (usuarioInativar == null)
            throw new ArgumentNullException(null, "Usuário não encontrado");

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
        await _authorization.GarantirPermissaoAsync(PermissaoCodigos.UsuariosReativar);
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
        if (!await EhCargoAdministradorAsync(usuario.IdCargo))
            return;

        if (await ContarUsuariosAdministradorAtivosAsync() == 1)
            throw new ConflitoDeNegocioException("Não é permitido remover o último administrador ativo do sistema.");
    }

    private async Task<int> ContarUsuariosAdministradorAtivosAsync(int? excluirId = null)
    {
        return await (
            from u in _context.Usuarios.AsNoTracking()
            join c in _context.Cargos.AsNoTracking() on u.IdCargo equals c.Id
            where u.Status == StatusUsuario.Ativo && c.EhAdministradorSistema
            where excluirId == null || u.Id != excluirId
            select u.Id).CountAsync();
    }

    private async Task<bool> EhCargoAdministradorAsync(int idCargo) =>
        await _context.Cargos.AsNoTracking()
            .AnyAsync(c => c.Id == idCargo && !c.IsDeleted && c.EhAdministradorSistema);

    private async Task GarantirCargoExisteAsync(int idCargo)
    {
        if (!await _context.Cargos.AnyAsync(c => c.Id == idCargo && !c.IsDeleted))
            throw new RegraDeNegocioInfringidaException("Cargo informado não existe.");
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

    private async Task<bool> EhAdministradorAsync() =>
        await _authorization.EhAdministradorAsync();

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
