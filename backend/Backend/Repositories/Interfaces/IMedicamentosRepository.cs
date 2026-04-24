using Backend.DTOs.Medicamentos;
using Backend.Models.Medicamentos;

namespace Backend.Repositories.Interfaces
{
    public interface IMedicamentosRepository : IRepository<MedicamentosModel>
    {
        Task<IEnumerable<MedicamentosModel>> GetAsync(MedicamentosFiltroDTO filtro);
    }
}