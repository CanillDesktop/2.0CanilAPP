using Backend.Models.Estoque;

namespace Backend.Repositories.Interfaces
{
    public interface IEstoqueItemRepository
    {
        Task<IEnumerable<ItemEstoqueModel>> GetByCodigoAsync(string codigo);
        Task<ItemEstoqueModel?> GetByLoteAsync(string lote);
        Task<ItemEstoqueModel> CreateAsync(ItemEstoqueModel obj, bool saveChanges = true);
        Task<ItemEstoqueModel?> UpdateAsync(ItemEstoqueModel obj, bool saveChanges = true);
        Task<bool> DeleteAsync(ItemEstoqueModel obj, bool saveChanges = true);
    }
}
