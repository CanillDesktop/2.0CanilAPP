using Backend.Models.Estoque;

namespace Backend.Repositories.Interfaces
{
    public interface IRetiradaEstoqueRepository
    {
        Task<IEnumerable<RetiradaEstoqueModel>> GetAsync();
        Task<RetiradaEstoqueModel?> CreateAsync(RetiradaEstoqueModel obj);
    }
}
