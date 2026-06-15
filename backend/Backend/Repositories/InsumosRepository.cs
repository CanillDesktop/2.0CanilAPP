using Backend.Context;
using Backend.Filtro.Helpers;
using Backend.Filtro.Insumos;
using Backend.Models.Insumos;
using Backend.Pagination;
using Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories
{
    public class InsumosRepository : BaseCRUDEstoqueRepository<InsumosModel>, IInsumosRepository
    {
        public InsumosRepository(CanilAppDbContext context) : base(context) { }

        public async Task<ConsultaPaginada<InsumosModel>> ConsultarPaginadoAsync(
        InsumosFiltro filtro,
        ItensPaginationParameters paginationParameters,
        int diasDataLimiteVencimento,
        CancellationToken cancellationToken = default)
        {
            var pageNumber = Math.Max(paginationParameters.PageNumber, 1);
            var pageSize = Math.Max(paginationParameters.PageSize, 1);

            var filtrada = FiltroHelper.AplicarFiltrosInsumos(
                FiltroHelper.Base(_context.Insumos.AsQueryable()),
                filtro);

            var hoje = DateTime.UtcNow.Date;
            var limiteVencimento = hoje.AddDays(diasDataLimiteVencimento);

            var resumo = new ItemComEstoqueResumoConsulta(
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

            var comStatus = FiltroHelper.AplicarStatusEstoque(filtrada, filtro.StatusEstoque);
            var totalCount = await comStatus.CountAsync(cancellationToken);

            var items = await PagedList<InsumosModel>.ToPagedListAsync(comStatus, pageNumber, pageSize, p => p.Id, cancellationToken);

            return new ConsultaPaginada<InsumosModel>(items, totalCount, resumo);
        }
    }
}



