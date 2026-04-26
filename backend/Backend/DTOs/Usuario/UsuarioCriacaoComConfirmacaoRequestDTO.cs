using Backend.Models.Enums;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Usuario;

public class UsuarioCriacaoComConfirmacaoRequestDTO
{
    [DisplayName("Primeiro nome")]
    [Required(ErrorMessage = "{0} é obrigatório")]
    [MinLength(2, ErrorMessage = "{0} deve ter no mínimo 2 caracteres")]
    [MaxLength(60, ErrorMessage = "{0} deve ter no máximo 60 caracteres")]
    public string PrimeiroNome { get; set; } = string.Empty;

    [DisplayName("Sobrenome")]
    [StringLength(80, MinimumLength = 2, ErrorMessage = "{0} deve ter entre 2 e 80 caracteres")]
    public string? Sobrenome { get; set; }

    [Required(ErrorMessage = "Email é obrigatório")]
    [EmailAddress(ErrorMessage = "Formato de email inválido")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Senha é obrigatória")]
    [MinLength(6, ErrorMessage = "Senha deve ter no mínimo 6 caracteres")]
    [MaxLength(100, ErrorMessage = "Senha deve ter no máximo 100 caracteres")]
    public string Senha { get; set; } = string.Empty;

    [DisplayName("Permissão")]
    public PermissoesEnum Permissao { get; set; } = PermissoesEnum.LEITURA;

    [MinLength(6, ErrorMessage = "Senha de confirmação inválida")]
    [MaxLength(100, ErrorMessage = "Senha de confirmação inválida")]
    public string? SenhaConfirmacao { get; set; }
}
