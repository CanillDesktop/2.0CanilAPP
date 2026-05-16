using Backend.DTOs.Estoque;

namespace Backend.Services.Interfaces;

public interface IRetiradaEstoqueHistoricoExportService
{
    Task<ArquivoExportadoDTO> ExportarHistoricoXlsxAsync(
        RetiradaEstoqueFiltroDTO filtro,
        bool ordemDataAscendente,
        CancellationToken cancellationToken = default);

    Task<ArquivoExportadoDTO> ExportarHistoricoCsvAsync(
        RetiradaEstoqueFiltroDTO filtro,
        bool ordemDataAscendente,
        CancellationToken cancellationToken = default);
}
