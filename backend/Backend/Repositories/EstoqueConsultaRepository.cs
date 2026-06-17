using Backend.Context;
using Backend.DTOs.Estoque;
using Backend.Models.Estoque;
using Backend.Pagination;
using Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;

namespace Backend.Repositories;

/// <summary>
/// Consulta paginada da listagem operacional de estoque (Opção A: uma entidade por requisição).
/// </summary>
public class EstoqueConsultaRepository : IEstoqueConsultaRepository
{
    private readonly CanilAppDbContext _context;

    public EstoqueConsultaRepository(CanilAppDbContext context) => _context = context;

    public async Task<EstoqueConsultaPaginada> ConsultarPaginadoAsync(
        EstoqueFiltroDTO filtro,
        EstoqueConsultaParameters parameters,
        CancellationToken cancellationToken = default)
    {

    

        return filtro.Origem switch
        {
            EstoqueOrigem.Produto => await ConsultarProdutosAsync(filtro, parameters, cancellationToken),
            EstoqueOrigem.Medicamento => await ConsultarMedicamentosAsync(filtro, parameters, cancellationToken),
            EstoqueOrigem.Insumo => await ConsultarInsumosAsync(filtro, parameters, cancellationToken),
            _ => throw new ArgumentOutOfRangeException(
                nameof(filtro), filtro.Origem, "Origem de estoque inválida."),
        };
    }

    private async Task<EstoqueConsultaPaginada> ConsultarProdutosAsync(
        EstoqueFiltroDTO filtro,
        EstoqueConsultaParameters parameters,
        CancellationToken cancellationToken)
    {
        var stopwatch = Stopwatch.StartNew();
  
        var query = EstoqueConsultaQueryable.Base(_context.Produtos.AsQueryable());
        query = EstoqueConsultaQueryable.AplicarTermoBuscaProdutos(query, filtro);
        query = EstoqueConsultaQueryable.AplicarFiltrosComuns(query, filtro);
        query = EstoqueConsultaQueryable.AplicarStatusOperacional(query, filtro.StatusOperacional);

        var totalCount = await query.CountAsync(cancellationToken);
        stopwatch.Stop();
        Console.WriteLine($"CountAsync: {stopwatch.ElapsedMilliseconds} ms");

        var ordenada = EstoqueConsultaQueryable.AplicarOrdenacaoProdutos(query, parameters);
        stopwatch.Restart();
        var items = await PaginarAsync(ordenada, parameters, cancellationToken);
        stopwatch.Stop();

        Console.WriteLine($"ToListAsync: {stopwatch.ElapsedMilliseconds} ms");


        return new EstoqueConsultaPaginada(items, totalCount);
        
    }

    private async Task<EstoqueConsultaPaginada> ConsultarMedicamentosAsync(
        EstoqueFiltroDTO filtro,
        EstoqueConsultaParameters parameters,
        CancellationToken cancellationToken)
    {
        var query = EstoqueConsultaQueryable.Base(_context.Medicamentos.AsQueryable());
        query = EstoqueConsultaQueryable.AplicarTermoBuscaMedicamentos(query, filtro);
        query = EstoqueConsultaQueryable.AplicarFiltrosComuns(query, filtro);
        query = EstoqueConsultaQueryable.AplicarStatusOperacional(query, filtro.StatusOperacional);

        var totalCount = await query.CountAsync(cancellationToken);

        var ordenada = EstoqueConsultaQueryable.AplicarOrdenacaoMedicamentos(query, parameters);
        var items = await PaginarAsync(ordenada, parameters, cancellationToken);

        return new EstoqueConsultaPaginada(items, totalCount);
    }

    private async Task<EstoqueConsultaPaginada> ConsultarInsumosAsync(
        EstoqueFiltroDTO filtro,
        EstoqueConsultaParameters parameters,
        CancellationToken cancellationToken)
    {
        var query = EstoqueConsultaQueryable.Base(_context.Insumos.AsQueryable());
        query = EstoqueConsultaQueryable.AplicarTermoBuscaInsumos(query, filtro);
        query = EstoqueConsultaQueryable.AplicarFiltrosComuns(query, filtro);
        query = EstoqueConsultaQueryable.AplicarStatusOperacional(query, filtro.StatusOperacional);

        var totalCount = await query.CountAsync(cancellationToken);

        var ordenada = EstoqueConsultaQueryable.AplicarOrdenacaoInsumos(query, parameters);
        var items = await PaginarAsync(ordenada, parameters, cancellationToken);

        return new EstoqueConsultaPaginada(items, totalCount);
    }

    private static async Task<IReadOnlyList<ItemComEstoqueBaseModel>> PaginarAsync<T>(
        IQueryable<T> ordenada,
        EstoqueConsultaParameters parameters,
        CancellationToken cancellationToken)
        where T : ItemComEstoqueBaseModel
    {
        var pageNumber = parameters.NormalizedPageNumber;
        var pageSize = parameters.PageSize;

        var items = await ordenada
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return items.Cast<ItemComEstoqueBaseModel>().ToList();
    }

    public async Task<EstoqueContagemConsulta> ObterContagemPorOrigemAsync(
        CancellationToken cancellationToken = default)
    {
        var produtos = await _context.Produtos.CountAsync(p => !p.IsDeleted, cancellationToken);
        var medicamentos = await _context.Medicamentos.CountAsync(m => !m.IsDeleted, cancellationToken);
        var insumos = await _context.Insumos.CountAsync(i => !i.IsDeleted, cancellationToken);

        return new EstoqueContagemConsulta(produtos, medicamentos, insumos);
    }
}
