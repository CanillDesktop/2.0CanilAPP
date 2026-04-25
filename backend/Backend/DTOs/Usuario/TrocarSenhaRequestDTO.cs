using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Usuario;

public class TrocarSenhaRequestDTO
{
    [Required(ErrorMessage = "Senha atual é obrigatória")]
    public string SenhaAtual { get; set; } = string.Empty;

    [Required(ErrorMessage = "Nova senha é obrigatória")]
    [MinLength(6, ErrorMessage = "Nova senha deve ter no mínimo 6 caracteres")]
    [MaxLength(100, ErrorMessage = "Nova senha deve ter no máximo 100 caracteres")]
    public string SenhaNova { get; set; } = string.Empty;
}
