using Backend.Context;
using Backend.DTOs.Estoque;
using Backend.Exceptions;
using Backend.Models.Enums;
using Backend.Models.Estoque;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class UnidadeEstoqueContextService : IUnidadeEstoqueContextService
{
    public const string HeaderUnidadeAtiva = "X-Unidade-Estoque-Id";

    private readonly CanilAppDbContext _context;
    private readonly IUserSessionService _userSession;
    private readonly IHttpContextAccessor _httpContextAccessor;

    private IReadOnlyList<UsuarioUnidadeEstoqueModel>? _vinculosCache;
    private int? _unidadeAtivaCache;

    public UnidadeEstoqueContextService(
        CanilAppDbContext context,
        IUserSessionService userSession,
        IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _userSession = userSession;
        _httpContextAccessor = httpContextAccessor;
    }

    public bool EhAdministrador() =>
        string.Equals(_userSession.Role, nameof(PermissoesEnum.ADMIN), StringComparison.OrdinalIgnoreCase);

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
        var unidades = await ObterUnidadesDisponiveisInternoAsync(cancellationToken);
        return unidades.Select(u => u.Id).ToList();
    }

    public Task GarantirConsultaAsync(int idUnidadeEstoque, CancellationToken cancellationToken = default) =>
        GarantirPermissaoAsync(idUnidadeEstoque, v => v.PodeConsultar || v.PodeEntrada || v.PodeSaida
            || v.PodeTransferirEnviar || v.PodeTransferirReceber, cancellationToken);

    public Task GarantirEntradaAsync(int idUnidadeEstoque, CancellationToken cancellationToken = default) =>
        GarantirPermissaoAsync(idUnidadeEstoque, v => v.PodeEntrada, cancellationToken);

    public Task GarantirSaidaAsync(int idUnidadeEstoque, CancellationToken cancellationToken = default) =>
        GarantirPermissaoAsync(idUnidadeEstoque, v => v.PodeSaida, cancellationToken);

    public Task GarantirTransferenciaEnviarAsync(int idUnidadeOrigem, CancellationToken cancellationToken = default) =>
        GarantirPermissaoAsync(idUnidadeOrigem, v => v.PodeTransferirEnviar, cancellationToken);

    public Task GarantirTransferenciaReceberAsync(int idUnidadeDestino, CancellationToken cancellationToken = default) =>
        GarantirPermissaoAsync(idUnidadeDestino, v => v.PodeTransferirReceber, cancellationToken);

    private async Task GarantirPermissaoAsync(
        int idUnidadeEstoque,
        Func<UsuarioUnidadeEstoqueModel, bool> predicado,
        CancellationToken cancellationToken)
    {
        if (EhAdministrador())
        {
            var existe = await _context.UnidadesEstoque.AsNoTracking()
                .AnyAsync(u => u.Id == idUnidadeEstoque && u.Ativa && !u.IsDeleted, cancellationToken);
            if (!existe)
                throw new RegraDeNegocioInfringidaException("Unidade de estoque inválida ou inativa.");
            return;
        }

        var vinculos = await ObterVinculosAsync(cancellationToken);
        var vinculo = vinculos.FirstOrDefault(v => v.IdUnidadeEstoque == idUnidadeEstoque);
        if (vinculo is null || !predicado(vinculo))
            throw new AcessoNegadoException("Sem permissão para operar nesta unidade de estoque.");
    }

    private async Task<IReadOnlyList<UnidadeEstoqueDTO>> ObterUnidadesDisponiveisInternoAsync(CancellationToken cancellationToken)
    {
        if (EhAdministrador())
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

        var vinculos = await ObterVinculosAsync(cancellationToken);
        var ids = vinculos
            .Where(v => v.PodeConsultar || v.PodeEntrada || v.PodeSaida || v.PodeTransferirEnviar || v.PodeTransferirReceber)
            .Select(v => v.IdUnidadeEstoque)
            .ToList();

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

    private async Task<IReadOnlyList<UsuarioUnidadeEstoqueModel>> ObterVinculosAsync(CancellationToken cancellationToken)
    {
        if (_vinculosCache is not null)
            return _vinculosCache;

        if (!int.TryParse(_userSession.UserId, out var userId) || userId <= 0)
            throw new AcessoNegadoException("Usuário não autenticado.");

        _vinculosCache = await _context.UsuariosUnidadesEstoque.AsNoTracking()
            .Where(v => v.IdUsuario == userId)
            .ToListAsync(cancellationToken);

        return _vinculosCache;
    }
}
