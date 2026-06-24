namespace Backend.DTOs.Dashboard;

public class DashboardAlertaItemDTO
{
    public int Id { get; set; }

    public string Nome { get; set; } = string.Empty;

    public int Quantidade { get; set; }

    public int Minimo { get; set; }

    public string Validade { get; set; } = string.Empty;

    public string Origem { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public string UltimaMovimentacao { get; set; } = string.Empty;

    public long? ValidadeMs { get; set; }

    public long? MovimentacaoMs { get; set; }
}
