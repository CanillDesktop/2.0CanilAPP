using Backend.DTOs.Produtos;
using Backend.Models.Produtos;
using Backend.Pagination;

namespace Backend.Services.Interfaces;

public interface IProdutosService : ICRUDEstoqueService<ProdutosModel>
{
    Task<ProdutosListaPaginadaDTO> BuscarPaginadoAsync(
        ProdutosFiltroDTO filtro,
        ProdutosParameters produtosParameters,
        CancellationToken cancellationToken = default);
}
