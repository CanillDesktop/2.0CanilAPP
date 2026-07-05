using Backend.Filtro.Produtos;
using Backend.Models.Produtos;
using Backend.Pagination;

namespace Backend.Repositories.Interfaces;

public interface IProdutosRepository : ICRUDEstoqueRepository<ProdutosModel>
{
    Task<ConsultaPaginada<ProdutosModel>> ConsultarPaginadoAsync(
        ProdutosFiltro filtro,
        EstoqueConsultaParameters paginationParameters,
        int diasDataLimiteVencimento,
        CancellationToken cancellationToken = default);
}
