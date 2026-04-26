using Backend.Models.Estoque;

namespace Backend.Services.Interfaces
{
    public interface IEstoqueItemService
    {
        Task<IEnumerable<ItemEstoqueModel>> BuscarTodosPorIdAsync(int id);
        Task<ItemEstoqueModel?> BuscarPorLoteAsync(string lote);
        Task<ItemEstoqueModel?> CriarAsync(ItemEstoqueModel model);
        Task<ItemEstoqueModel?> AtualizarAsync(string lote, ItemEstoqueModel model);
        Task<bool> DeletarAsync(string lote);

    }
}

