using Backend.DTOs.Dashboard;

namespace Backend.Services.Interfaces;

public interface IDashboardService
{
    Task<DashboardResumoDTO> ObterResumoAsync(CancellationToken cancellationToken = default);

    Task<DashboardAlertasPaginadosDTO> ListarAlertasAsync(
        string tipo,
        string? origem,
        string? termo,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default);
}
