using Backend.Models.Enums;
using Backend.Models.Usuarios;

namespace Backend.Models.Estoque;

public class MovimentacaoEstoqueModel
{
    public int Id { get; set; }
    public int IdUnidadeEstoque { get; set; }
    public int IdItem { get; set; }
    public string Lote { get; set; } = string.Empty;
    public int Quantidade { get; set; }
    public int SaldoAposMovimentacao { get; set; }
    public TipoMovimentacaoEstoqueEnum TipoMovimentacao { get; set; }
    public string? OrigemMovimentacao { get; set; }
    public int? IdTransferencia { get; set; }
    public int? IdRetirada { get; set; }
    public int IdUsuario { get; set; }
    public DateTime DataHoraMovimentacao { get; set; } = DateTime.UtcNow;
    public string? Observacao { get; set; }
    public string? NFe { get; set; }
    public string? FornecedorNome { get; set; }
    public string? FornecedorDocumento { get; set; }
    public string? DoadorNome { get; set; }
    public string? DoadorDocumento { get; set; }

    public UnidadeEstoqueModel? UnidadeEstoque { get; set; }
    public ItemComEstoqueBaseModel? Item { get; set; }
    public TransferenciaEstoqueModel? Transferencia { get; set; }
    public RetiradaEstoqueModel? Retirada { get; set; }
    public UsuariosModel? Usuario { get; set; }
}
