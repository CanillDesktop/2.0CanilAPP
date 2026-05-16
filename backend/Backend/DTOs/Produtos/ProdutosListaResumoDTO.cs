namespace Backend.DTOs.Produtos;

/// <summary>
/// Totais de estoque considerando o mesmo recorte de busca + categoria (+ NFe/datas) do filtro,
/// mas <b>sem</b> o filtro de status — permite ver a distribuição real do subconjunto.
/// </summary>
public class ProdutosListaResumoDTO
{
    public int TotalNoRecorte { get; set; }

    public int Ativos { get; set; }

    public int BaixoEstoque { get; set; }

    public int SemEstoque { get; set; }

    public int AVencer { get; set; }
}
