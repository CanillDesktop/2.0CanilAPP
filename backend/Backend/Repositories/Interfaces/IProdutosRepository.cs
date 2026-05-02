using Backend.DTOs.Produtos;
using Backend.Models.Produtos;
using Backend.Pagination;

namespace Backend.Repositories.Interfaces
{
    public interface IProdutosRepository : ICRUDEstoqueRepository<ProdutosModel>
    {

        Task<IEnumerable<ProdutosModel>> GetAsync(ProdutosFiltroDTO filtro, ProdutosParameters produtosParameters);
    }
}
