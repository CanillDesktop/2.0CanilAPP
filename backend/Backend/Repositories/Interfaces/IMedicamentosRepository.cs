using Backend.Filtro.Medicamentos;
using Backend.Models.Medicamentos;
using Backend.Pagination;

namespace Backend.Repositories.Interfaces
{
    public interface IMedicamentosRepository : ICRUDEstoqueRepository<MedicamentosModel>
    {
        Task<ConsultaPaginada<MedicamentosModel>> ConsultarPaginadoAsync(
        MedicamentosFiltro filtro,
        ItensPaginationParameters produtosParameters,
        int diasDataLimiteVencimento,
        CancellationToken cancellationToken = default);
    }
}