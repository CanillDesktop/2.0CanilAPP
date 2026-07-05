using Backend.DTOs.Estoque;
using Backend.Pagination;

namespace Backend.Repositories.Interfaces;

public interface IEstoqueLookupRepository
{
    Task<(IReadOnlyList<ItemEstoqueLookupLeituraDTO> Items, int TotalCount)> BuscarItensAsync(
        EstoqueLookupItensFiltroDTO filtro,
        PaginationParameters parameters,
        int idUnidade,
        CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<LoteEstoqueLookupLeituraDTO> Items, int TotalCount)> BuscarLotesAsync(
        EstoqueLookupLotesFiltroDTO filtro,
        PaginationParameters parameters,
        int idUnidade,
        CancellationToken cancellationToken = default);
}
