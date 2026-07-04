namespace Backend.DTOs;

/// <summary>
/// Totais por item (produto/insumo/medicamento), não por lote, no mesmo recorte de busca
/// + NFe/datas do filtro, mas <b>sem</b> o filtro de status — permite ver a distribuição real do subconjunto.
/// </summary>
public class ItemComEstoqueListaResumoDTO
{
    public int TotalNoRecorte { get; set; }

    public int Ativos { get; set; }

    public int BaixoEstoque { get; set; }

    public int SemEstoque { get; set; }

    public int AVencer { get; set; }
}
