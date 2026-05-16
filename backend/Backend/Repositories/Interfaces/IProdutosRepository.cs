using Backend.DTOs.Produtos;
using Backend.Models.Produtos;
using Backend.Pagination;

namespace Backend.Repositories.Interfaces;

public interface IProdutosRepository : ICRUDEstoqueRepository<ProdutosModel>
{
    Task<ProdutosConsultaPaginada> ConsultarPaginadoAsync(
        ProdutosFiltroDTO filtro,
        ProdutosParameters produtosParameters,
        CancellationToken cancellationToken = default);
}
