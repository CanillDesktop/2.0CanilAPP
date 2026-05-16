namespace Backend.DTOs.Estoque;

public class RetiradaEstoqueHistoricoListaPaginadaDTO
{
    public IReadOnlyList<RetiradaEstoqueHistoricoItemDTO> Items { get; set; } = [];

    public int TotalCount { get; set; }

    public int PageNumber { get; set; }

    public int PageSize { get; set; }

    public int TotalPages { get; set; }

    /// <summary>Metadados de totais sempre coerentes com o mesmo intervalo aplicado aos itens paginados.</summary>
    public RetiradaEstoqueMetricasFiltragemDTO Metricas { get; set; } = new();

    /// <summary>Intervalo efetivamente aplicado (UTC) nas consultas ao banco.</summary>
    public DateTime DataInicioUtcAplicada { get; set; }

    public DateTime DataFimUtcInclusiveAplicada { get; set; }
}
