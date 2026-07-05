using Backend.Context;
using Backend.DTOs.Permissoes;
using Backend.Exceptions;
using Backend.Models.Enums;
using Backend.Models.Permissoes;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class PermissaoAuthorizationService : IPermissaoAuthorizationService
{
    private readonly CanilAppDbContext _context;
    private readonly IUserSessionService _userSession;

    private int? _usuarioIdCache;
    private bool? _ehAdminCache;
    private HashSet<string>? _globaisCache;
    private Dictionary<int, HashSet<string>>? _porUnidadeCache;

    public PermissaoAuthorizationService(CanilAppDbContext context, IUserSessionService userSession)
    {
        _context = context;
        _userSession = userSession;
    }

    public async Task<bool> EhAdministradorAsync(int? idUsuario = null, CancellationToken cancellationToken = default)
    {
        if (_ehAdminCache.HasValue && idUsuario is null)
            return _ehAdminCache.Value;

        var userId = ResolverIdUsuario(idUsuario);
        if (userId <= 0)
            return false;

        if (string.Equals(_userSession.Role, nameof(PermissoesEnum.ADMIN), StringComparison.OrdinalIgnoreCase)
            && idUsuario is null)
        {
            _ehAdminCache = true;
            return true;
        }

        var possui = await PossuiPermissaoInternoAsync(userId, PermissaoCodigos.SistemaAdministrador, null, cancellationToken);
        if (idUsuario is null)
            _ehAdminCache = possui;

        return possui;
    }

    public async Task<bool> PossuiPermissaoAsync(
        string codigoPermissao,
        int? idUnidadeEstoque = null,
        int? idUsuario = null,
        CancellationToken cancellationToken = default)
    {
        if (await EhAdministradorAsync(idUsuario, cancellationToken))
            return true;

        var userId = ResolverIdUsuario(idUsuario);
        if (userId <= 0)
            return false;

        return await PossuiPermissaoInternoAsync(userId, codigoPermissao, idUnidadeEstoque, cancellationToken);
    }

    public async Task GarantirPermissaoAsync(
        string codigoPermissao,
        int? idUnidadeEstoque = null,
        CancellationToken cancellationToken = default)
    {
        if (!await PossuiPermissaoAsync(codigoPermissao, idUnidadeEstoque, cancellationToken: cancellationToken))
            throw new AcessoNegadoException("Sem permissão para executar esta operação.");
    }

    public async Task<IReadOnlyList<string>> ObterCodigosGlobaisAsync(int idUsuario, CancellationToken cancellationToken = default)
    {
        await CarregarCacheAsync(idUsuario, cancellationToken);
        return _globaisCache?.ToList() ?? [];
    }

    public async Task<UsuarioPermissoesResumoDTO> ObterResumoAsync(int idUsuario, CancellationToken cancellationToken = default)
    {
        await CarregarCacheAsync(idUsuario, cancellationToken);

        var unidades = await (
            from a in _context.UsuariosPermissoes.AsNoTracking()
            join p in _context.Permissoes.AsNoTracking() on a.IdPermissao equals p.Id
            join u in _context.UnidadesEstoque.AsNoTracking() on a.IdUnidadeEstoque equals u.Id
            where a.IdUsuario == idUsuario && a.IdUnidadeEstoque != null && !p.IsDeleted
            group p.Codigo by new { a.IdUnidadeEstoque, u.Sigla } into g
            select new UsuarioPermissaoUnidadeDTO
            {
                IdUnidadeEstoque = g.Key.IdUnidadeEstoque!.Value,
                SiglaUnidade = g.Key.Sigla,
                Codigos = g.OrderBy(c => c).ToList(),
            }).ToListAsync(cancellationToken);

        return new UsuarioPermissoesResumoDTO
        {
            CodigosGlobais = _globaisCache?.OrderBy(c => c).ToList() ?? [],
            PorUnidade = unidades,
        };
    }

    private async Task<bool> PossuiPermissaoInternoAsync(
        int idUsuario,
        string codigoPermissao,
        int? idUnidadeEstoque,
        CancellationToken cancellationToken)
    {
        await CarregarCacheAsync(idUsuario, cancellationToken);

        if (_globaisCache!.Contains(codigoPermissao))
            return true;

        if (idUnidadeEstoque is null or <= 0)
            return false;

        return _porUnidadeCache!.TryGetValue(idUnidadeEstoque.Value, out var codigos)
            && codigos.Contains(codigoPermissao);
    }

    private async Task CarregarCacheAsync(int idUsuario, CancellationToken cancellationToken)
    {
        if (_usuarioIdCache == idUsuario && _globaisCache is not null)
            return;

        var atribuicoes = await (
            from a in _context.UsuariosPermissoes.AsNoTracking()
            join p in _context.Permissoes.AsNoTracking() on a.IdPermissao equals p.Id
            where a.IdUsuario == idUsuario && !p.IsDeleted
            select new { p.Codigo, a.IdUnidadeEstoque }).ToListAsync(cancellationToken);

        _globaisCache = atribuicoes
            .Where(a => a.IdUnidadeEstoque is null)
            .Select(a => a.Codigo)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        _porUnidadeCache = atribuicoes
            .Where(a => a.IdUnidadeEstoque is not null)
            .GroupBy(a => a.IdUnidadeEstoque!.Value)
            .ToDictionary(
                g => g.Key,
                g => g.Select(x => x.Codigo).ToHashSet(StringComparer.OrdinalIgnoreCase));

        _usuarioIdCache = idUsuario;
    }

    private int ResolverIdUsuario(int? idUsuario)
    {
        if (idUsuario is > 0)
            return idUsuario.Value;

        return int.TryParse(_userSession.UserId, out var logado) ? logado : 0;
    }
}
