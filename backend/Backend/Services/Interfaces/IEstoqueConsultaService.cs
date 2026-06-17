using Backend.DTOs.Common;
using Backend.DTOs.Estoque;
using Backend.Pagination;

namespace Backend.Services.Interfaces;

/// <summary>
/// Consulta paginada/filtrada/ordenada da listagem operacional de estoque (/estoque).
/// Separado de IEstoqueItemService (que cuida do CRUD de lote).
/// </summary>
public interface IEstoqueConsultaService
{
    /// <summary>
    /// Listagem paginada da aba indicada em <paramref name="filtro"/>.Origem (Opção A).
    /// </summary>
    Task<PagedResultDto<EstoqueLinhaLeituraDTO>> ConsultarPaginadoAsync(
        EstoqueFiltroDTO filtro,
        EstoqueConsultaParameters parameters,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Contagens para os rótulos das abas (ex.: "Produtos (42)").
    /// </summary>
    Task<EstoqueContagemPorOrigemDTO> ObterContagemPorOrigemAsync(
        CancellationToken cancellationToken = default);
}
