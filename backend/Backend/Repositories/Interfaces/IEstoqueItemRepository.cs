using Backend.Models.Estoque;

namespace Backend.Repositories.Interfaces
{
    public interface IEstoqueItemRepository
    {
        Task<IEnumerable<ItemEstoqueModel>> GetByCodigoAsync(string codigo);
        Task<ItemEstoqueModel?> GetByLoteAsync(string lote);
        Task<ItemEstoqueModel> CreateAsync(ItemEstoqueModel obj);
        Task<ItemEstoqueModel?> UpdateAsync(ItemEstoqueModel obj);
        Task<bool> DeleteAsync(ItemEstoqueModel obj);
    }
}
