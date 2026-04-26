using Backend.DTOs.Insumos;
using Backend.Models.Insumos;

namespace Backend.Services.Interfaces
{
    public interface IInsumosService : ICRUDEstoqueService<InsumosModel>
    {
        Task<IEnumerable<InsumosModel>> BuscarTodosAsync(InsumosFiltroDTO filtro);
    }
}

