using Backend.DTOs;
using Backend.DTOs.Insumos;
using Backend.Filtro.Insumos;
using Backend.Models.Insumos;
using Backend.Pagination;

namespace Backend.Services.Interfaces
{
    public interface IInsumosService : ICRUDEstoqueService<InsumosModel>
    {
        Task<ItemComEstoqueListaPaginadaDTO<InsumosLeituraDTO>> BuscarPaginadoAsync(
        InsumosFiltro filtro,
        ItensPaginationParameters paginationParameters,
        CancellationToken cancellationToken = default);
    }
}

