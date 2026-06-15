using Backend.DTOs.Estoque;
using Backend.Models.Estoque;

namespace Backend.Services.Interfaces
{
    public interface IEstoqueItemService
    {
        Task<IEnumerable<ItemEstoqueModel>> BuscarPorCodigoAsync(string codigo);
        Task<ItemEstoqueModel?> BuscarPorLoteAsync(string lote);
        Task<ItemEstoqueModel?> CriarAsync(ItemEstoqueModel model);
        Task<ItemEstoqueModel?> AtualizarAsync(string lote, ItemEstoqueModel model);
        Task<bool> DeletarAsync(string lote);

        /// <summary>
        /// Gera (pelo LoteGeradorService) o próximo lote e devolve também o código do item,
        /// para a tela de cadastro exibir esses valores apenas para conferência.
        /// </summary>
        Task<ProximoLoteEstoqueDTO> GerarProximoLoteAsync(int itemId);
    }
}

