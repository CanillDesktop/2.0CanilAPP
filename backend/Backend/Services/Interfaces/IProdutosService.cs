using Backend.DTOs;
using Backend.DTOs.Produtos;
using Backend.Filtro.Produtos;
using Backend.Models.Produtos;
using Backend.Pagination;

namespace Backend.Services.Interfaces;

public interface IProdutosService : ICRUDEstoqueService<ProdutosModel>
{
    Task<ItemComEstoqueListaPaginadaDTO<ProdutosLeituraDTO>> BuscarPaginadoAsync(
        ProdutosFiltro filtro,
        ItensPaginationParameters paginationParameters,
        CancellationToken cancellationToken = default);
}
