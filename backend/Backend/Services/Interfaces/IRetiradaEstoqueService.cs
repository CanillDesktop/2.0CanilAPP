using Backend.DTOs.Estoque;
using Backend.Models.Estoque;
using Backend.Pagination;

namespace Backend.Services.Interfaces;

public interface IRetiradaEstoqueService
{
    Task<IEnumerable<RetiradaEstoqueModel>> BuscarTodosAsync();

    Task<RetiradaEstoqueModel?> CriarAsync(string lote, RetiradaEstoqueModel obj);

    Task<RetiradaEstoqueHistoricoListaPaginadaDTO> ConsultarHistoricoPaginadoAsync(
        RetiradaEstoqueFiltroDTO filtro,
        RetiradaEstoquePaginationParameters parameters,
        CancellationToken cancellationToken = default);
}
