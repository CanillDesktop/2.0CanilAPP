using Backend.DTOs;
using Backend.DTOs.Medicamentos;
using Backend.Filtro.Medicamentos;
using Backend.Models.Medicamentos;
using Backend.Pagination;

namespace Backend.Services.Interfaces
{
    public interface IMedicamentosService : ICRUDEstoqueService<MedicamentosModel>
    {
        Task<ItemComEstoqueListaPaginadaDTO<MedicamentoLeituraDTO>> BuscarPaginadoAsync(
        MedicamentosFiltro filtro,
        ItensPaginationParameters paginationParameters,
        CancellationToken cancellationToken = default);
    }
}