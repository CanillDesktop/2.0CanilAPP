namespace Backend.Filtro.Produtos;

public class ProdutosFiltro
{
    /// <summary>
    /// Opcional: busca OR pelos campos: Codigo, DescricaoSimples, DescricaoDetalhada, nFe e Lote
    /// </summary>
    public string? Termo { get; set; }

    /// <summary>Categoria (enum int). Ausente ou null = todas.</summary>
    public int? Categoria { get; set; }

    public DateTime? DataEntrega { get; set; }

    public DateTime? DataValidade { get; set; }

    /// <summary>todos | ativo | baixo | a_vencer | sem_estoque</summary>
    public string? StatusEstoque { get; set; }

    /// <summary>
    /// Quando informado (<c>secretaria</c> ou <c>canil</c>), retorna apenas produtos com saldo
    /// positivo exclusivamente nessa unidade. Exige permissão de consulta nas duas unidades.
    /// </summary>
    public string? ExclusivoUnidade { get; set; }
}
