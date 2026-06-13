using Backend.Filtro.Produtos;
using Backend.Models.Produtos;
using Backend.Pagination;

namespace Backend.Repositories.Interfaces;

public interface IProdutosRepository : ICRUDEstoqueRepository<ProdutosModel>
{
    Task<ProdutosConsultaPaginada> ConsultarPaginadoAsync(
        ProdutosFiltro filtro,
        ProdutosParameters produtosParameters,
        CancellationToken cancellationToken = default);
}
