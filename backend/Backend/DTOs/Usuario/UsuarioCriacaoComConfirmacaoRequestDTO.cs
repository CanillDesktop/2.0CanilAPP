using Backend.Models.Enums;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Usuario;

public class UsuarioCriacaoComConfirmacaoRequestDTO
{
    [DisplayName("Primeiro nome")]
    [Required(ErrorMessage = "{0} é obrigatório")]
    [MinLength(2, ErrorMessage = "{0} deve ter no mínimo {1} caracteres")]
    [MaxLength(60, ErrorMessage = "{0} deve ter no máximo {1} caracteres")]
    public string PrimeiroNome { get; set; } = string.Empty;

    [StringLength(80, MinimumLength = 2, ErrorMessage = "{0} deve ter entre {2} e {1} caracteres")]
    public string? Sobrenome { get; set; }

    [Required(ErrorMessage = "{0} é obrigatório")]
    [EmailAddress(ErrorMessage = "Formato de email inválido")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "{0}} é obrigatória")]
    [MinLength(6, ErrorMessage = "{0} deve ter no mínimo {1} caracteres")]
    [MaxLength(100, ErrorMessage = "{0} deve ter no máximo {1} caracteres")]
    public string Senha { get; set; } = string.Empty;

    [DisplayName("Confirmar senha")]
    [Required(ErrorMessage = "O campo '{0}' é obrigatório")]
    [Compare(nameof(Senha), ErrorMessage = "As senhas não coincidem")]
    public string? SenhaConfirmacao { get; set; }

    [DisplayName("Permissão")]
    public PermissoesEnum Permissao { get; set; } = PermissoesEnum.LEITURA;

}
