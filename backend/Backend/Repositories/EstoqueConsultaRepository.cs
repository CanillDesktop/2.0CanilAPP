using Backend.Context;
using Backend.DTOs.Estoque;
using Backend.Pagination;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;

namespace Backend.Repositories;

public class EstoqueConsultaRepository : IEstoqueConsultaRepository
{
    private readonly CanilAppDbContext _context;
    private readonly IUnidadeEstoqueContextService _unidadeContext;

    public EstoqueConsultaRepository(CanilAppDbContext context, IUnidadeEstoqueContextService unidadeContext)
    {
        _context = context;
        _unidadeContext = unidadeContext;
    }

    public async Task<EstoqueConsultaPaginada> ConsultarPaginadoAsync(
        EstoqueFiltroDTO filtro,
        EstoqueConsultaParameters parameters,
        CancellationToken cancellationToken = default)
    {
        var idUnidade = await _unidadeContext.ObterUnidadeAtivaIdAsync(cancellationToken);
        await _unidadeContext.GarantirConsultaAsync(idUnidade, cancellationToken);

        return filtro.Origem switch
        {
            EstoqueOrigem.Produto => await ConsultarProdutosAsync(filtro, parameters, idUnidade, cancellationToken),
            EstoqueOrigem.Medicamento => await ConsultarMedicamentosAsync(filtro, parameters, idUnidade, cancellationToken),
            EstoqueOrigem.Insumo => await ConsultarInsumosAsync(filtro, parameters, idUnidade, cancellationToken),
            _ => throw new ArgumentOutOfRangeException(
                nameof(filtro), filtro.Origem, "Origem de estoque inválida."),
        };
    }

    private async Task<EstoqueConsultaPaginada> ConsultarProdutosAsync(
        EstoqueFiltroDTO filtro,
        EstoqueConsultaParameters parameters,
        int idUnidade,
        CancellationToken cancellationToken)
    {
        var stopwatch = Stopwatch.StartNew();

        var query = EstoqueConsultaQueryable.Base(_context.Produtos.AsQueryable(), idUnidade);
        query = EstoqueConsultaQueryable.AplicarTermoBuscaProdutos(query, filtro);
        query = EstoqueConsultaQueryable.AplicarFiltrosComuns(query, filtro, idUnidade);
        query = EstoqueConsultaQueryable.AplicarStatusOperacional(query, filtro.StatusOperacional, idUnidade);

        var totalCount = await query.CountAsync(cancellationToken);
        stopwatch.Stop();
        Console.WriteLine($"CountAsync: {stopwatch.ElapsedMilliseconds} ms");

        var ordenada = EstoqueConsultaQueryable.AplicarOrdenacaoProdutos(query, parameters, idUnidade);
        stopwatch.Restart();
        var items = await PaginarAsync(ordenada, parameters, cancellationToken);
        stopwatch.Stop();
        Console.WriteLine($"ToListAsync: {stopwatch.ElapsedMilliseconds} ms");

        return new EstoqueConsultaPaginada(items, totalCount);
    }

    private async Task<EstoqueConsultaPaginada> ConsultarMedicamentosAsync(
        EstoqueFiltroDTO filtro,
        EstoqueConsultaParameters parameters,
        int idUnidade,
        CancellationToken cancellationToken)
    {
        var query = EstoqueConsultaQueryable.Base(_context.Medicamentos.AsQueryable(), idUnidade);
        query = EstoqueConsultaQueryable.AplicarTermoBuscaMedicamentos(query, filtro);
        query = EstoqueConsultaQueryable.AplicarFiltrosComuns(query, filtro, idUnidade);
        query = EstoqueConsultaQueryable.AplicarStatusOperacional(query, filtro.StatusOperacional, idUnidade);

        var totalCount = await query.CountAsync(cancellationToken);
        var ordenada = EstoqueConsultaQueryable.AplicarOrdenacaoMedicamentos(query, parameters, idUnidade);
        var items = await PaginarAsync(ordenada, parameters, cancellationToken);

        return new EstoqueConsultaPaginada(items, totalCount);
    }

    private async Task<EstoqueConsultaPaginada> ConsultarInsumosAsync(
        EstoqueFiltroDTO filtro,
        EstoqueConsultaParameters parameters,
        int idUnidade,
        CancellationToken cancellationToken)
    {
        var query = EstoqueConsultaQueryable.Base(_context.Insumos.AsQueryable(), idUnidade);
        query = EstoqueConsultaQueryable.AplicarTermoBuscaInsumos(query, filtro);
        query = EstoqueConsultaQueryable.AplicarFiltrosComuns(query, filtro, idUnidade);
        query = EstoqueConsultaQueryable.AplicarStatusOperacional(query, filtro.StatusOperacional, idUnidade);

        var totalCount = await query.CountAsync(cancellationToken);
        var ordenada = EstoqueConsultaQueryable.AplicarOrdenacaoInsumos(query, parameters, idUnidade);
        var items = await PaginarAsync(ordenada, parameters, cancellationToken);

        return new EstoqueConsultaPaginada(items, totalCount);
    }

    private static async Task<IReadOnlyList<Models.Estoque.ItemComEstoqueBaseModel>> PaginarAsync<T>(
        IQueryable<T> ordenada,
        EstoqueConsultaParameters parameters,
        CancellationToken cancellationToken)
        where T : Models.Estoque.ItemComEstoqueBaseModel
    {
        var pageNumber = parameters.NormalizedPageNumber;
        var pageSize = parameters.PageSize;

        var items = await ordenada
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return items.Cast<Models.Estoque.ItemComEstoqueBaseModel>().ToList();
    }

    public async Task<EstoqueContagemConsulta> ObterContagemPorOrigemAsync(
        CancellationToken cancellationToken = default)
    {
        var idUnidade = await _unidadeContext.ObterUnidadeAtivaIdAsync(cancellationToken);
        await _unidadeContext.GarantirConsultaAsync(idUnidade, cancellationToken);

        var produtos = await _context.Produtos.CountAsync(p => !p.IsDeleted, cancellationToken);
        var medicamentos = await _context.Medicamentos.CountAsync(m => !m.IsDeleted, cancellationToken);
        var insumos = await _context.Insumos.CountAsync(i => !i.IsDeleted, cancellationToken);

        return new EstoqueContagemConsulta(produtos, medicamentos, insumos);
    }
}
