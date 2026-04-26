using Backend.DTOs.Medicamentos;
using Backend.Models.Medicamentos;

namespace Backend.Services.Interfaces
{
    public interface IMedicamentosService : ICRUDEstoqueService<MedicamentosModel>
    {
        Task<IEnumerable<MedicamentosModel>> BuscarTodosAsync(MedicamentosFiltroDTO filtro);
    }
}