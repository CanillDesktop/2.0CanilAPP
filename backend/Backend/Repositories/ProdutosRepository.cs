using Backend.Context;
using Backend.DTOs.Produtos;
using Backend.Models.Produtos;
using Backend.Pagination;
using Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

public class ProdutosRepository : BaseCRUDEstoqueRepository<ProdutosModel>, IProdutosRepository
{
    public ProdutosRepository(CanilAppDbContext context) : base(context) { }

    public async Task<ProdutosConsultaPaginada> ConsultarPaginadoAsync(
        ProdutosFiltroDTO filtro,
        ProdutosParameters produtosParameters,
        CancellationToken cancellationToken = default)
    {
        var pageNumber = Math.Max(produtosParameters.PageNumber, 1);
        var pageSize = produtosParameters.PageSize;

        var filtrada = ProdutosConsultaQueryable.AplicarFiltros(
            ProdutosConsultaQueryable.Base(_context.Produtos.AsQueryable()),
            filtro);

        var hoje = DateTime.UtcNow.Date;
        var limiteVencimento = hoje.AddDays(30);

        var resumo = new ProdutosResumoConsulta(
            TotalNoRecorte: await filtrada.CountAsync(cancellationToken),
            Ativos: await filtrada.CountAsync(
                p => p.ItensEstoque.Where(e => !e.IsDeleted).Sum(e => e.Quantidade) > 0
                     && p.ItensEstoque.Where(e => !e.IsDeleted).Sum(e => e.Quantidade)
                        >= (p.ItemNivelEstoque != null ? p.ItemNivelEstoque.NivelMinimoEstoque : 0),
                cancellationToken),
            BaixoEstoque: await filtrada.CountAsync(
                p => p.ItensEstoque.Where(e => !e.IsDeleted).Sum(e => e.Quantidade) > 0
                     && p.ItensEstoque.Where(e => !e.IsDeleted).Sum(e => e.Quantidade)
                        < (p.ItemNivelEstoque != null ? p.ItemNivelEstoque.NivelMinimoEstoque : 0),
                cancellationToken),
            SemEstoque: await filtrada.CountAsync(
                p => !p.ItensEstoque.Any(e => !e.IsDeleted)
                     || p.ItensEstoque.Where(e => !e.IsDeleted).Sum(e => e.Quantidade) <= 0,
                cancellationToken),
            AVencer: await filtrada.CountAsync(
                p => p.ItensEstoque.Any(e =>
                    !e.IsDeleted
                    && e.DataValidade != null
                    && e.DataValidade >= hoje
                    && e.DataValidade <= limiteVencimento),
                cancellationToken));

        var comStatus = ProdutosConsultaQueryable.AplicarStatusEstoque(filtrada, filtro.StatusEstoque);
        var totalCount = await comStatus.CountAsync(cancellationToken);

        var items = await comStatus
            .OrderBy(p => p.Id)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new ProdutosConsultaPaginada(items, totalCount, resumo);
    }
}
