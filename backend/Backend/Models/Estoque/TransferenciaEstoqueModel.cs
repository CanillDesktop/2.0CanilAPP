using Backend.Models.Enums;
using Backend.Models.Usuarios;

namespace Backend.Models.Estoque;

public class TransferenciaEstoqueModel : BaseModel
{
    public int IdUnidadeOrigem { get; set; }
    public int? IdUnidadeDestino { get; set; }
    public DateTime DataTransferencia { get; set; } = DateTime.UtcNow;
    public int IdUsuarioEnvio { get; set; }
    public int? IdUsuarioRecebimento { get; set; }
    public int? IdUsuarioAprovacao { get; set; }
    public TransferenciaEstoqueStatusEnum Status { get; set; } = TransferenciaEstoqueStatusEnum.Rascunho;
    public string ResponsavelEnvio { get; set; } = string.Empty;
    public string? ResponsavelRecebimento { get; set; }
    public string? Observacao { get; set; }

    public UnidadeEstoqueModel? UnidadeOrigem { get; set; }
    public UnidadeEstoqueModel? UnidadeDestino { get; set; }
    public UsuariosModel? UsuarioEnvio { get; set; }
    public UsuariosModel? UsuarioRecebimento { get; set; }
    public ICollection<TransferenciaEstoqueItemModel> Itens { get; set; } = [];
}
