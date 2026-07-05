using Backend.Context;
using Backend.DTOs.Estoque;
using Backend.Exceptions;
using Backend.Models.Estoque;
using Backend.Models.Permissoes;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class UnidadeEstoqueContextService : IUnidadeEstoqueContextService
{
    public const string HeaderUnidadeAtiva = "X-Unidade-Estoque-Id";

    private readonly CanilAppDbContext _context;
    private readonly IUserSessionService _userSession;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IPermissaoAuthorizationService _authorization;

    private IReadOnlyList<int>? _unidadesPermitidasCache;
    private int? _unidadeAtivaCache;

    public UnidadeEstoqueContextService(
        CanilAppDbContext context,
        IUserSessionService userSession,
        IHttpContextAccessor httpContextAccessor,
        IPermissaoAuthorizationService authorization)
    {
        _context = context;
        _userSession = userSession;
        _httpContextAccessor = httpContextAccessor;
        _authorization = authorization;
    }

    public bool EhAdministrador() =>
        _authorization.EhAdministradorAsync().GetAwaiter().GetResult();

    public async Task<ContextoUnidadeEstoqueDTO> ObterContextoAsync(CancellationToken cancellationToken = default)
    {
        var unidades = await ObterUnidadesDisponiveisInternoAsync(cancellationToken);
        var ativaId = await ObterUnidadeAtivaIdAsync(cancellationToken);
        var ativa = unidades.First(u => u.Id == ativaId);

        return new ContextoUnidadeEstoqueDTO
        {
            UnidadeAtivaId = ativaId,
            UnidadeAtivaNome = ativa.Nome,
            UnidadeAtivaSigla = ativa.Sigla,
            UnidadesDisponiveis = unidades,
        };
    }

    public async Task<int> ObterUnidadeAtivaIdAsync(CancellationToken cancellationToken = default)
    {
        if (_unidadeAtivaCache.HasValue)
            return _unidadeAtivaCache.Value;

        var unidades = await ObterUnidadesDisponiveisInternoAsync(cancellationToken);
        if (unidades.Count == 0)
            throw new AcessoNegadoException("Usuário sem unidade de estoque vinculada.");

        var header = _httpContextAccessor.HttpContext?.Request.Headers[HeaderUnidadeAtiva].FirstOrDefault();
        if (int.TryParse(header, out var solicitada) && unidades.Any(u => u.Id == solicitada))
        {
            _unidadeAtivaCache = solicitada;
            return solicitada;
        }

        _unidadeAtivaCache = unidades[0].Id;
        return unidades[0].Id;
    }

    public async Task<IReadOnlyList<int>> ObterUnidadesPermitidasAsync(CancellationToken cancellationToken = default)
    {
        if (_unidadesPermitidasCache is not null)
            return _unidadesPermitidasCache;

        var unidades = await ObterUnidadesDisponiveisInternoAsync(cancellationToken);
        _unidadesPermitidasCache = unidades.Select(u => u.Id).ToList();
        return _unidadesPermitidasCache;
    }

    public Task GarantirConsultaAsync(int idUnidadeEstoque, CancellationToken cancellationToken = default) =>
        GarantirQualquerPermissaoUnidadeAsync(
            idUnidadeEstoque,
            [
                PermissaoCodigos.EstoqueConsultar,
                PermissaoCodigos.EstoqueEntrada,
                PermissaoCodigos.EstoqueSaida,
                PermissaoCodigos.EstoqueTransferirEnviar,
                PermissaoCodigos.EstoqueTransferirReceber,
            ],
            cancellationToken);

    public Task GarantirEntradaAsync(int idUnidadeEstoque, CancellationToken cancellationToken = default) =>
        GarantirPermissaoUnidadeAsync(idUnidadeEstoque, PermissaoCodigos.EstoqueEntrada, cancellationToken);

    public Task GarantirSaidaAsync(int idUnidadeEstoque, CancellationToken cancellationToken = default) =>
        GarantirPermissaoUnidadeAsync(idUnidadeEstoque, PermissaoCodigos.EstoqueSaida, cancellationToken);

    public Task GarantirTransferenciaEnviarAsync(int idUnidadeOrigem, CancellationToken cancellationToken = default) =>
        GarantirPermissaoUnidadeAsync(idUnidadeOrigem, PermissaoCodigos.EstoqueTransferirEnviar, cancellationToken);

    public Task GarantirTransferenciaReceberAsync(int idUnidadeDestino, CancellationToken cancellationToken = default) =>
        GarantirPermissaoUnidadeAsync(idUnidadeDestino, PermissaoCodigos.EstoqueTransferirReceber, cancellationToken);

    private async Task GarantirPermissaoUnidadeAsync(
        int idUnidadeEstoque,
        string codigoPermissao,
        CancellationToken cancellationToken)
    {
        await GarantirUnidadeExisteAsync(idUnidadeEstoque, cancellationToken);
        await _authorization.GarantirPermissaoAsync(codigoPermissao, idUnidadeEstoque, cancellationToken);
    }

    private async Task GarantirQualquerPermissaoUnidadeAsync(
        int idUnidadeEstoque,
        IReadOnlyList<string> codigos,
        CancellationToken cancellationToken)
    {
        await GarantirUnidadeExisteAsync(idUnidadeEstoque, cancellationToken);

        foreach (var codigo in codigos)
        {
            if (await _authorization.PossuiPermissaoAsync(codigo, idUnidadeEstoque, cancellationToken: cancellationToken))
                return;
        }

        throw new AcessoNegadoException("Sem permissão para operar nesta unidade de estoque.");
    }

    private async Task GarantirUnidadeExisteAsync(int idUnidadeEstoque, CancellationToken cancellationToken)
    {
        var existe = await _context.UnidadesEstoque.AsNoTracking()
            .AnyAsync(u => u.Id == idUnidadeEstoque && u.Ativa && !u.IsDeleted, cancellationToken);

        if (!existe)
            throw new RegraDeNegocioInfringidaException("Unidade de estoque inválida ou inativa.");
    }

    private async Task<IReadOnlyList<UnidadeEstoqueDTO>> ObterUnidadesDisponiveisInternoAsync(CancellationToken cancellationToken)
    {
        if (await _authorization.EhAdministradorAsync(cancellationToken: cancellationToken))
        {
            return await _context.UnidadesEstoque.AsNoTracking()
                .Where(u => u.Ativa && !u.IsDeleted)
                .OrderBy(u => u.Id)
                .Select(u => new UnidadeEstoqueDTO
                {
                    Id = u.Id,
                    Nome = u.Nome,
                    Sigla = u.Sigla,
                    Tipo = u.Tipo,
                    Ativa = u.Ativa,
                })
                .ToListAsync(cancellationToken);
        }

        if (!int.TryParse(_userSession.UserId, out var userId) || userId <= 0)
            throw new AcessoNegadoException("Usuário não autenticado.");

        var resumo = await _authorization.ObterResumoAsync(userId, cancellationToken);
        var ids = resumo.PorUnidade.Select(u => u.IdUnidadeEstoque).Distinct().ToList();

        if (ids.Count == 0)
            return [];

        return await _context.UnidadesEstoque.AsNoTracking()
            .Where(u => ids.Contains(u.Id) && u.Ativa && !u.IsDeleted)
            .OrderBy(u => u.Id)
            .Select(u => new UnidadeEstoqueDTO
            {
                Id = u.Id,
                Nome = u.Nome,
                Sigla = u.Sigla,
                Tipo = u.Tipo,
                Ativa = u.Ativa,
            })
            .ToListAsync(cancellationToken);
    }
}
