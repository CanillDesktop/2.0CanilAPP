namespace Backend.Models.Estoque;

public class TransferenciaEstoqueItemModel
{
    public int Id { get; set; }
    public int IdTransferencia { get; set; }
    public int IdItem { get; set; }
    public string Lote { get; set; } = string.Empty;
    public int Quantidade { get; set; }
    public decimal? ValorUnitario { get; set; }
    public int? IdMovimentacaoSaida { get; set; }
    public int? IdMovimentacaoEntrada { get; set; }

    public TransferenciaEstoqueModel? Transferencia { get; set; }
    public ItemComEstoqueBaseModel? Item { get; set; }
}
