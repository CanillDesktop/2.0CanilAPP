namespace Backend.DTOs.Produtos;

public class ProdutosFiltroDTO
{
    /// <summary>Opcional: busca única em código ou descrição (OR).</summary>
    public string? TermoBusca { get; set; }

    public string? CodProduto { get; set; }

    public string? DescricaoSimples { get; set; }

    public string? NFe { get; set; }

    /// <summary>Categoria (enum int). Ausente ou null = todas.</summary>
    public int? Categoria { get; set; }

    public DateTime? DataEntrega { get; set; }

    public DateTime? DataValidade { get; set; }

    /// <summary>todos | ativo | baixo | a_vencer | sem_estoque</summary>
    public string? StatusEstoque { get; set; }
}
