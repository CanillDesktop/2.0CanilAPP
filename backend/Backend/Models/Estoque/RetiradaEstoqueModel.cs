using Backend.DTOs.Estoque;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models.Estoque;

public class RetiradaEstoqueModel
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public string Codigo { get; set; } = string.Empty;
    public string NomeOuDescricaoSimples { get; set; } = string.Empty;
    public int Quantidade { get; set; }
    public string Lote { get; set; } = string.Empty;

    /// <summary>Texto informado sobre quem retira (instantâneo histórico; pode diferir do cadastro atual).</summary>
    public string De { get; set; } = string.Empty;

    /// <summary>Destino textual (pessoa externa ou descrição livre).</summary>
    public string Para { get; set; } = string.Empty;

    public DateTime DataHoraRetirada { get; set; } = DateTime.UtcNow;

    /// <summary>Notas de auditoria (motivo opcional).</summary>
    public string? Observacao { get; set; }

    /// <summary>Estado atual da linha na trilha de auditoria (ex.: CONFIRMADA).</summary>
    public string Status { get; set; } = RetiradaEstoqueStatus.Confirmada;

    public int? IdUsuarioRetirante { get; set; }

    public int? IdUsuarioRecebedor { get; set; }

    /// <summary>Indica que, no momento da retirada, o lote estava vencido (com autorização do usuário logado).</summary>
    public bool EstavaVencido { get; set; }

    /// <summary>Data de validade do lote retirado (registrada para auditoria de retirada de itens vencidos).</summary>
    public DateTime? DataValidadeLote { get; set; }

    public static implicit operator RetiradaEstoqueModel(RetiradaEstoqueDTO dto)
    {
        return new RetiradaEstoqueModel()
        {
            Codigo = dto.Codigo,
            NomeOuDescricaoSimples = dto.NomeOuDescricaoSimples,
            Lote = dto.Lote,
            De = dto.De,
            Para = dto.Para,
            Quantidade = dto.Quantidade,
            Observacao = dto.Observacao,
            IdUsuarioRecebedor = dto.IdUsuarioRecebedor,
        };
    }

    public static implicit operator RetiradaEstoqueDTO(RetiradaEstoqueModel model)
    {
        return new RetiradaEstoqueDTO()
        {
            Codigo = model.Codigo,
            NomeOuDescricaoSimples = model.NomeOuDescricaoSimples,
            Lote = model.Lote,
            De = model.De,
            Para = model.Para,
            Quantidade = model.Quantidade,
            DataHoraRetirada = model.DataHoraRetirada,
            Observacao = model.Observacao,
            IdUsuarioRecebedor = model.IdUsuarioRecebedor,
            EstavaVencido = model.EstavaVencido,
            DataValidadeLote = model.DataValidadeLote,
        };
    }
}
