using Backend.Models.Estoque;

namespace Backend.Repositories.Interfaces
{
    public interface IEstoqueItemRepository
    {
        Task<IEnumerable<ItemEstoqueModel>> GetByCodigoAsync(string codigo);
        Task<ItemEstoqueModel?> GetByLoteAsync(string lote);

        /// <summary>
        /// Carrega o item base (produto/medicamento/insumo) pelo Id interno, já no tipo concreto,
        /// para que o serviço possa gerar o lote correto e obter o código oficial do item.
        /// </summary>
        Task<ItemComEstoqueBaseModel?> ObterItemBasePorIdAsync(int id);
        Task<ItemEstoqueModel> CreateAsync(ItemEstoqueModel obj, bool saveChanges = true);
        Task<ItemEstoqueModel?> UpdateAsync(ItemEstoqueModel obj, bool saveChanges = true);
        Task<bool> DeleteAsync(ItemEstoqueModel obj, bool saveChanges = true);
    }
}
