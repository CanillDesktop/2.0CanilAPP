namespace Backend.DTOs.Estoque;

/// <summary>Filtros do histórico. Período: informe período rápido OU datas (início/fim) em UTC.</summary>
public class RetiradaEstoqueFiltroDTO
{
    /// <summary>Valores aceitos (case-insensitive): <c>HOJE</c>, <c>ULTIMOS_7_DIAS</c>, <c>ULTIMOS_30_DIAS</c>.</summary>
    public string? PeriodoRapido { get; set; }

    public DateTime? DataInicioUtc { get; set; }

    /// <summary>Fim inclusivo até o segundo 23:59:59 UTC do mesmo dia quando não especificado maior precisão.</summary>
    public DateTime? DataFimUtc { get; set; }

    public int? IdUsuarioRetirante { get; set; }

    public int? IdUsuarioRecebedor { get; set; }

    /// <summary>
    /// Busca em Id (se numérico), código, nome, lote ou textos livres retirante/destinatário.
    /// </summary>
    public string? TermoBusca { get; set; }
}
