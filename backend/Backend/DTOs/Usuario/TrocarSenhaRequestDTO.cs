using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Usuario;

public class TrocarSenhaRequestDTO
{
    [DisplayName("Senha atual")]
    [Required(ErrorMessage = "O campo '{0}' não pode ser vazio")]
    public string SenhaAtual { get; set; } = string.Empty;

    [DisplayName("Nova senha")]
    [Required(ErrorMessage = "O campo '{0}' não pode ser vazio")]
    [MinLength(6, ErrorMessage = "{0} deve ter no mínimo {1} caracteres")]
    [MaxLength(100, ErrorMessage = "{0} deve ter no máximo {1} caracteres")]
    public string NovaSenha { get; set; } = string.Empty;
}
