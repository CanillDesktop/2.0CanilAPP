using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Usuario;

public class ConfirmacaoSenhaRequestDTO
{
    [Required(ErrorMessage = "Senha de confirmação é obrigatória")]
    [MinLength(6, ErrorMessage = "Senha de confirmação inválida")]
    [MaxLength(100, ErrorMessage = "Senha de confirmação inválida")]
    public string SenhaConfirmacao { get; set; } = string.Empty;
}
