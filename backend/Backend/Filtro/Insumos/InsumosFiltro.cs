namespace Backend.Filtro.Insumos;

public class InsumosFiltro
{
    /// <summary>
    /// Opcional: busca OR pelos campos: Codigo, DescricaoSimplificada, DescricaoDetalhada, nFe e Lote
    /// </summary>
    public string? Termo { get; set; }

    /// <summary>Unidade (enum int). Ausente ou null = todas.</summary>
    public int? Unidade { get; set; }

    public DateTime? DataEntrega { get; set; }
    public DateTime? DataValidade { get; set; }

    /// <summary>todos | ativo | baixo | a_vencer | sem_estoque</summary>
    public string? StatusEstoque { get; set; }
}
