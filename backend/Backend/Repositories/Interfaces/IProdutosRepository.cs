using Backend.DTOs.Produtos;
using Backend.Models.Produtos;

namespace Backend.Repositories.Interfaces
{
    public interface IProdutosRepository : ICRUDEstoqueRepository<ProdutosModel>
    {
        Task<IEnumerable<ProdutosModel>> GetAsync(ProdutosFiltroDTO filtro);
    }
}
