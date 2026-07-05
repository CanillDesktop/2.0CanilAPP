using Backend.DTOs.Common;
using Backend.DTOs.Estoque;
using Backend.Pagination;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;

namespace Backend.Services;

public class EstoqueLookupService : IEstoqueLookupService
{
    private const int TextoMinimoCaracteres = 2;

    private readonly IEstoqueLookupRepository _repository;
    private readonly IUnidadeEstoqueContextService _unidadeContext;

    public EstoqueLookupService(
        IEstoqueLookupRepository repository,
        IUnidadeEstoqueContextService unidadeContext)
    {
        _repository = repository;
        _unidadeContext = unidadeContext;
    }

    public async Task<PagedResultDto<ItemEstoqueLookupLeituraDTO>> BuscarItensAsync(
        EstoqueLookupItensFiltroDTO filtro,
        PaginationParameters parameters,
        CancellationToken cancellationToken = default)
    {
        var idUnidade = await _unidadeContext.ObterUnidadeAtivaIdAsync(cancellationToken);
        await _unidadeContext.GarantirConsultaAsync(idUnidade, cancellationToken);

        var texto = filtro.Texto?.Trim() ?? string.Empty;
        if (!ConsultaItensPermitida(texto))
        {
            return PagedResultFactory.Create(
                Array.Empty<ItemEstoqueLookupLeituraDTO>(),
                0,
                parameters.NormalizedPageNumber,
                parameters.PageSize);
        }

        var (items, totalCount) = await _repository.BuscarItensAsync(
            filtro,
            parameters,
            idUnidade,
            cancellationToken);

        return PagedResultFactory.Create(
            items,
            totalCount,
            parameters.NormalizedPageNumber,
            parameters.PageSize);
    }

    public async Task<PagedResultDto<LoteEstoqueLookupLeituraDTO>> BuscarLotesAsync(
        EstoqueLookupLotesFiltroDTO filtro,
        PaginationParameters parameters,
        CancellationToken cancellationToken = default)
    {
        if (filtro.ItemId <= 0)
            throw new ArgumentException("ItemId é obrigatório.", nameof(filtro));

        var idUnidade = await _unidadeContext.ObterUnidadeAtivaIdAsync(cancellationToken);
        await _unidadeContext.GarantirConsultaAsync(idUnidade, cancellationToken);

        var (items, totalCount) = await _repository.BuscarLotesAsync(
            filtro,
            parameters,
            idUnidade,
            cancellationToken);

        return PagedResultFactory.Create(
            items,
            totalCount,
            parameters.NormalizedPageNumber,
            parameters.PageSize);
    }

    private static bool ConsultaItensPermitida(string texto)
    {
        if (string.IsNullOrWhiteSpace(texto))
            return false;

        if (int.TryParse(texto, out _))
            return true;

        return texto.Length >= TextoMinimoCaracteres;
    }
}
