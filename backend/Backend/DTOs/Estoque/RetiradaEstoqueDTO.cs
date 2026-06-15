using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Estoque;

public class RetiradaEstoqueDTO
{
    [Display(Name = "Código")]
    [Required(ErrorMessage = "{0} é obrigatório")]
    public string Codigo { get; set; } = string.Empty;

    [Display(Name = "Nome/descrição do recurso")]
    [Required(ErrorMessage = "{0} é obrigatório")]
    public string NomeOuDescricaoSimples { get; set; } = string.Empty;

    [Required(ErrorMessage = "{0} é obrigatório")]
    public string Lote { get; set; } = string.Empty;

    [Required(ErrorMessage = "O nome do usuário retirando o recurso não pode ser vazio")]
    public string De { get; set; } = string.Empty;

    [Required(ErrorMessage = "O nome da pessoa a receber o recurso não pode ser vazio")]
    public string Para { get; set; } = string.Empty;

    [Required(ErrorMessage = "{0} é obrigatória")]
    public int Quantidade { get; set; }

    /// <summary>Ignorado na gravação: o servidor registra sempre UTC atual para integridade da auditoria.</summary>
    public DateTime DataHoraRetirada { get; set; } = DateTime.UtcNow;

    [MaxLength(2000)]
    public string? Observacao { get; set; }

    /// <summary>Recebedor opcional quando o destinatário é um usuário cadastrado no sistema.</summary>
    public int? IdUsuarioRecebedor { get; set; }

    /// <summary>Confirmação explícita do usuário para retirar mesmo com o lote vencido.</summary>
    public bool ConfirmarLoteVencido { get; set; }

    /// <summary>Saída: indica que o lote retirado estava vencido.</summary>
    public bool EstavaVencido { get; set; }

    /// <summary>Saída: data de validade do lote retirado.</summary>
    public DateTime? DataValidadeLote { get; set; }
}
