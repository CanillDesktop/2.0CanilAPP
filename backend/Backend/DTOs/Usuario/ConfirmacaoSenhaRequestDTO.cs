using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Usuario;

public class ConfirmacaoSenhaRequestDTO
{
    [DisplayName("Confirmar senha")]
    [Required(ErrorMessage = "É necessário confirmar a senha")]
    public string SenhaConfirmacao { get; set; } = string.Empty;
}
