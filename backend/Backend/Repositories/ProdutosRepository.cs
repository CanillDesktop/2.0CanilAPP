using Backend.Context;
using Backend.Filtro.Helpers;
using Backend.Filtro.Produtos;
using Backend.Models.Produtos;
using Backend.Pagination;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

public class ProdutosRepository : BaseCRUDEstoqueRepository<ProdutosModel>, IProdutosRepository
{
    public ProdutosRepository(CanilAppDbContext context, IUnidadeEstoqueContextService unidadeContext)
        : base(context, unidadeContext) { }

    public async Task<ConsultaPaginada<ProdutosModel>> ConsultarPaginadoAsync(
        ProdutosFiltro filtro,
        ItensPaginationParameters paginationParameters,
        int diasDataLimiteVencimento,
        CancellationToken cancellationToken = default)
    {
        var idUnidade = await _unidadeContext.ObterUnidadeAtivaIdAsync(cancellationToken);
        await _unidadeContext.GarantirConsultaAsync(idUnidade, cancellationToken);

        var pageNumber = Math.Max(paginationParameters.PageNumber, 1);
        var pageSize = paginationParameters.PageSize;

        var filtrada = FiltroHelper.AplicarFiltrosProdutos(
            FiltroHelper.Base(_context.Produtos.AsQueryable(), idUnidade),
            filtro,
            idUnidade);

        var hoje = DateTime.UtcNow.Date;
        var limiteVencimento = hoje.AddDays(diasDataLimiteVencimento);

        var resumo = new ItemComEstoqueResumoConsulta(
            TotalNoRecorte: await filtrada.CountAsync(cancellationToken),
            Ativos: await filtrada.CountAsync(
                p => p.ItensEstoque.Where(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidade).Sum(e => e.Quantidade) > 0
                     && p.ItensEstoque.Where(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidade).Sum(e => e.Quantidade)
                        >= (p.ItensNivelEstoque.Where(n => !n.IsDeleted && n.IdUnidadeEstoque == idUnidade)
                            .Select(n => (int?)n.NivelMinimoEstoque).FirstOrDefault() ?? 0),
                cancellationToken),
            BaixoEstoque: await filtrada.CountAsync(
                p => p.ItensEstoque.Where(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidade).Sum(e => e.Quantidade) > 0
                     && p.ItensEstoque.Where(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidade).Sum(e => e.Quantidade)
                        < (p.ItensNivelEstoque.Where(n => !n.IsDeleted && n.IdUnidadeEstoque == idUnidade)
                            .Select(n => (int?)n.NivelMinimoEstoque).FirstOrDefault() ?? 0),
                cancellationToken),
            SemEstoque: await filtrada.CountAsync(
                p => !p.ItensEstoque.Any(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidade)
                     || p.ItensEstoque.Where(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidade).Sum(e => e.Quantidade) <= 0,
                cancellationToken),
            AVencer: await filtrada.CountAsync(
                p => p.ItensEstoque.Any(e =>
                    !e.IsDeleted
                    && e.IdUnidadeEstoque == idUnidade
                    && e.DataValidade != null
                    && e.DataValidade >= hoje
                    && e.DataValidade <= limiteVencimento),
                cancellationToken));

        var comStatus = FiltroHelper.AplicarStatusEstoque(filtrada, filtro.StatusEstoque, idUnidade);
        var totalCount = await comStatus.CountAsync(cancellationToken);

        var items = await PagedList<ProdutosModel>.ToPagedListAsync(comStatus, pageNumber, pageSize, p => p.Id, cancellationToken);

        return new ConsultaPaginada<ProdutosModel>(items, totalCount, resumo);
    }
}
