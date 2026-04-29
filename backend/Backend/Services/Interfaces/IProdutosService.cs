using Backend.DTOs.Produtos;
using Backend.Models.Produtos;

namespace Backend.Services.Interfaces
{
    public interface IProdutosService : ICRUDEstoqueService<ProdutosModel>
    {
        Task<IEnumerable<ProdutosModel>> BuscarTodosAsync(ProdutosFiltroDTO filtro);
    }
}
