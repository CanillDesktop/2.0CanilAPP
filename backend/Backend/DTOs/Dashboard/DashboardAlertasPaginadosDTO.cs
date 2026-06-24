namespace Backend.DTOs.Dashboard;

public class DashboardAlertasPaginadosDTO
{
    public IReadOnlyList<DashboardAlertaItemDTO> Items { get; set; } = [];

    public int TotalCount { get; set; }

    public int PageNumber { get; set; }

    public int PageSize { get; set; }

    public int TotalPages { get; set; }
}
