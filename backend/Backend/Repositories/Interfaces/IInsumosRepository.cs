using Backend.Filtro.Insumos;
using Backend.Models.Insumos;
using Backend.Pagination;

namespace Backend.Repositories.Interfaces
{
    public interface IInsumosRepository : ICRUDEstoqueRepository<InsumosModel>
    {
        Task<ConsultaPaginada<InsumosModel>> ConsultarPaginadoAsync(
        InsumosFiltro filtro,
        ItensPaginationParameters produtosParameters,
        int diasDataLimiteVencimento,
        CancellationToken cancellationToken = default);
    }
}

