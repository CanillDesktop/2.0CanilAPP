using Backend.Context;
using Backend.DTOs.Estoque;
using Backend.Filtro.Helpers;
using Backend.Models.Estoque;
using Backend.Models.Insumos;
using Backend.Models.Medicamentos;
using Backend.Models.Produtos;
using Backend.Pagination;
using Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

public class EstoqueLookupRepository : IEstoqueLookupRepository
{
    private readonly CanilAppDbContext _context;

    public EstoqueLookupRepository(CanilAppDbContext context)
    {
        _context = context;
    }

    public async Task<(IReadOnlyList<ItemEstoqueLookupLeituraDTO> Items, int TotalCount)> BuscarItensAsync(
        EstoqueLookupItensFiltroDTO filtro,
        PaginationParameters parameters,
        int idUnidade,
        CancellationToken cancellationToken = default)
    {
        var termo = filtro.Texto?.Trim() ?? string.Empty;
        var buscaPorId = int.TryParse(termo, out var idExato);

        var produtos = ProjetarProdutos(idUnidade, termo, buscaPorId, idExato);
        var medicamentos = ProjetarMedicamentos(idUnidade, termo, buscaPorId, idExato);
        var insumos = ProjetarInsumos(idUnidade, termo, buscaPorId, idExato);

        var totalCount =
            await produtos.CountAsync(cancellationToken)
            + await medicamentos.CountAsync(cancellationToken)
            + await insumos.CountAsync(cancellationToken);

        if (totalCount == 0)
            return ([], 0);

        const int limiteMerge = 500;
        var produtosLista = await produtos.OrderBy(i => i.Descricao).ThenBy(i => i.Id).Take(limiteMerge).ToListAsync(cancellationToken);
        var medicamentosLista = await medicamentos.OrderBy(i => i.Descricao).ThenBy(i => i.Id).Take(limiteMerge).ToListAsync(cancellationToken);
        var insumosLista = await insumos.OrderBy(i => i.Descricao).ThenBy(i => i.Id).Take(limiteMerge).ToListAsync(cancellationToken);

        var pageNumber = parameters.NormalizedPageNumber;
        var pageSize = parameters.PageSize;
        var skip = (pageNumber - 1) * pageSize;

        var pagina = produtosLista
            .Concat(medicamentosLista)
            .Concat(insumosLista)
            .OrderBy(i => i.Descricao)
            .ThenBy(i => i.Id)
            .Skip(skip)
            .Take(pageSize)
            .ToList();

        return (pagina, totalCount);
    }

    public async Task<(IReadOnlyList<LoteEstoqueLookupLeituraDTO> Items, int TotalCount)> BuscarLotesAsync(
        EstoqueLookupLotesFiltroDTO filtro,
        PaginationParameters parameters,
        int idUnidade,
        CancellationToken cancellationToken = default)
    {
        if (filtro.ItemId <= 0)
            return ([], 0);

        var hoje = DateTime.UtcNow.Date;
        var limiteVencimento = hoje.AddDays(EstoqueStatusOperacional.DiasProximoVencimento);

        var query = _context.ItensEstoque
            .AsNoTracking()
            .Where(e =>
                !e.IsDeleted
                && e.Id == filtro.ItemId
                && e.IdUnidadeEstoque == idUnidade
                && e.Quantidade > 0);

        if (TermoBuscaQueryable.TryNormalizar(filtro.Texto, out var termoLote))
        {
            query = query.Where(e => e.Lote != null && e.Lote.ToLower().Contains(termoLote));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var ordenada = AplicarOrdenacaoLotes(query, filtro.OrderBy, filtro.SortDirection);

        var pageNumber = parameters.NormalizedPageNumber;
        var pageSize = parameters.PageSize;

        var items = await ordenada
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(e => new LoteEstoqueLookupLeituraDTO
            {
                Lote = e.Lote ?? string.Empty,
                Saldo = e.Quantidade,
                Validade = e.DataValidade,
                DataEntrega = e.DataEntrega,
                Status =
                    e.DataValidade != null && e.DataValidade.Value.Date < hoje
                        ? "vencido"
                        : e.DataValidade != null && e.DataValidade.Value.Date <= limiteVencimento
                            ? "proximo_vencimento"
                            : "ok",
            })
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    private IQueryable<ItemEstoqueLookupLeituraDTO> ProjetarProdutos(
        int idUnidade,
        string termo,
        bool buscaPorId,
        int idExato)
    {
        var query = _context.Produtos
            .AsNoTracking()
            .Where(p =>
                !p.IsDeleted
                && p.ItensEstoque.Any(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidade));

        query = AplicarFiltroProdutos(query, termo, buscaPorId, idExato);

        return query.Select(p => new ItemEstoqueLookupLeituraDTO
        {
            Id = p.Id,
            Codigo = p.Codigo,
            Descricao = p.DescricaoSimples,
            Origem = EstoqueOrigem.Produto,
            Saldo = p.ItensEstoque
                .Where(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidade)
                .Sum(e => e.Quantidade),
        });
    }

    private IQueryable<ItemEstoqueLookupLeituraDTO> ProjetarMedicamentos(
        int idUnidade,
        string termo,
        bool buscaPorId,
        int idExato)
    {
        var query = _context.Medicamentos
            .AsNoTracking()
            .Where(m =>
                !m.IsDeleted
                && m.ItensEstoque.Any(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidade));

        query = AplicarFiltroMedicamentos(query, termo, buscaPorId, idExato);

        return query.Select(m => new ItemEstoqueLookupLeituraDTO
        {
            Id = m.Id,
            Codigo = m.Codigo,
            Descricao = m.NomeComercial,
            Origem = EstoqueOrigem.Medicamento,
            Saldo = m.ItensEstoque
                .Where(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidade)
                .Sum(e => e.Quantidade),
        });
    }

    private IQueryable<ItemEstoqueLookupLeituraDTO> ProjetarInsumos(
        int idUnidade,
        string termo,
        bool buscaPorId,
        int idExato)
    {
        var query = _context.Insumos
            .AsNoTracking()
            .Where(i =>
                !i.IsDeleted
                && i.ItensEstoque.Any(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidade));

        query = AplicarFiltroInsumos(query, termo, buscaPorId, idExato);

        return query.Select(i => new ItemEstoqueLookupLeituraDTO
        {
            Id = i.Id,
            Codigo = i.Codigo,
            Descricao = i.DescricaoSimplificada,
            Origem = EstoqueOrigem.Insumo,
            Saldo = i.ItensEstoque
                .Where(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidade)
                .Sum(e => e.Quantidade),
        });
    }

    private static IQueryable<ProdutosModel> AplicarFiltroProdutos(
        IQueryable<ProdutosModel> query,
        string termo,
        bool buscaPorId,
        int idExato)
    {
        if (string.IsNullOrWhiteSpace(termo))
            return query.Where(_ => false);

        if (buscaPorId)
        {
            var t = termo.ToLower();
            return query.Where(p =>
                p.Id == idExato
                || (p.Codigo != null && p.Codigo.ToLower().Contains(t))
                || (p.DescricaoSimples != null && p.DescricaoSimples.ToLower().Contains(t)));
        }

        if (!TermoBuscaQueryable.TryNormalizar(termo, out var normalizado))
            return query.Where(_ => false);

        return query.Where(p =>
            (p.Codigo != null && p.Codigo.ToLower().Contains(normalizado))
            || (p.DescricaoSimples != null && p.DescricaoSimples.ToLower().Contains(normalizado)));
    }

    private static IQueryable<MedicamentosModel> AplicarFiltroMedicamentos(
        IQueryable<MedicamentosModel> query,
        string termo,
        bool buscaPorId,
        int idExato)
    {
        if (string.IsNullOrWhiteSpace(termo))
            return query.Where(_ => false);

        if (buscaPorId)
        {
            var t = termo.ToLower();
            return query.Where(m =>
                m.Id == idExato
                || (m.Codigo != null && m.Codigo.ToLower().Contains(t))
                || (m.NomeComercial != null && m.NomeComercial.ToLower().Contains(t))
                || (m.Formula != null && m.Formula.ToLower().Contains(t)));
        }

        if (!TermoBuscaQueryable.TryNormalizar(termo, out var normalizado))
            return query.Where(_ => false);

        return query.Where(m =>
            (m.Codigo != null && m.Codigo.ToLower().Contains(normalizado))
            || (m.NomeComercial != null && m.NomeComercial.ToLower().Contains(normalizado))
            || (m.Formula != null && m.Formula.ToLower().Contains(normalizado)));
    }

    private static IQueryable<InsumosModel> AplicarFiltroInsumos(
        IQueryable<InsumosModel> query,
        string termo,
        bool buscaPorId,
        int idExato)
    {
        if (string.IsNullOrWhiteSpace(termo))
            return query.Where(_ => false);

        if (buscaPorId)
        {
            var t = termo.ToLower();
            return query.Where(i =>
                i.Id == idExato
                || (i.Codigo != null && i.Codigo.ToLower().Contains(t))
                || (i.DescricaoSimplificada != null && i.DescricaoSimplificada.ToLower().Contains(t)));
        }

        if (!TermoBuscaQueryable.TryNormalizar(termo, out var normalizado))
            return query.Where(_ => false);

        return query.Where(i =>
            (i.Codigo != null && i.Codigo.ToLower().Contains(normalizado))
            || (i.DescricaoSimplificada != null && i.DescricaoSimplificada.ToLower().Contains(normalizado)));
    }

    private static IQueryable<ItemEstoqueModel> AplicarOrdenacaoLotes(
        IQueryable<ItemEstoqueModel> query,
        string? orderBy,
        string? sortDirection)
    {
        var asc = !string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase);
        var campo = orderBy?.Trim().ToLowerInvariant() ?? "validade";

        return campo switch
        {
            "saldo" => asc
                ? query.OrderBy(e => e.Quantidade).ThenBy(e => e.Lote)
                : query.OrderByDescending(e => e.Quantidade).ThenBy(e => e.Lote),
            "lote" => asc
                ? query.OrderBy(e => e.Lote)
                : query.OrderByDescending(e => e.Lote),
            _ => asc
                ? query.OrderBy(e => e.DataValidade ?? DateTime.MaxValue).ThenBy(e => e.Lote)
                : query.OrderByDescending(e => e.DataValidade ?? DateTime.MinValue).ThenBy(e => e.Lote),
        };
    }
}
