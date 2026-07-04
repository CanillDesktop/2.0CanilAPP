using Backend.DTOs.Estoque;

namespace Backend.Services.Interfaces;

public interface ITransferenciaEstoqueExportService
{
    Task<ArquivoExportadoDTO> ExportarXlsxAsync(CancellationToken cancellationToken = default);
    Task<ArquivoExportadoDTO> ExportarCsvAsync(CancellationToken cancellationToken = default);
}
