using Backend.DTOs.Common;
using Backend.DTOs.Estoque;
using Backend.Pagination;

namespace Backend.Services.Interfaces;

public interface IEstoqueLookupService
{
    Task<PagedResultDto<ItemEstoqueLookupLeituraDTO>> BuscarItensAsync(
        EstoqueLookupItensFiltroDTO filtro,
        PaginationParameters parameters,
        CancellationToken cancellationToken = default);

    Task<PagedResultDto<LoteEstoqueLookupLeituraDTO>> BuscarLotesAsync(
        EstoqueLookupLotesFiltroDTO filtro,
        PaginationParameters parameters,
        CancellationToken cancellationToken = default);
}
