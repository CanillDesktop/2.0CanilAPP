using Backend.DTOs.Insumos;
using Backend.Models.Insumos;

namespace Backend.Repositories.Interfaces
{
    public interface IInsumosRepository : IRepository<InsumosModel>
    {
        Task<IEnumerable<InsumosModel>> GetAsync(InsumosFiltroDTO filtro);
    }
}

