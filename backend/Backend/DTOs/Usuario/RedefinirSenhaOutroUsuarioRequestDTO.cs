using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Usuario;

public class RedefinirSenhaOutroUsuarioRequestDTO
{
    private string? _novaSenha;

    [DisplayName("Nova senha")]
    [Required(ErrorMessage = "O campo '{0}' não pode ser vazio")]
    [MinLength(6, ErrorMessage = "{0} deve ter no mínimo {1} caracteres")]
    [MaxLength(100, ErrorMessage = "{0} deve ter no máximo {1} caracteres")]
    [RegularExpression(@"^\S+$", ErrorMessage = "{0} não pode conter espaços")]
    public string? NovaSenha
    {
        get => _novaSenha;
        set => _novaSenha = string.IsNullOrEmpty(value) ? null : value;
    }

    [DisplayName("Sua senha")]
    [Required(ErrorMessage = "O campo '{0}' não pode ser vazio")]
    public string SenhaConfirmacao { get; set; } = string.Empty;
}
