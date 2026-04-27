using Backend.Models.Enums;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Usuario;

public class UsuarioCriacaoComConfirmacaoRequestDTO
{
    private string? _primeiroNome;
    private string? _sobrenome;
    private string? _email;
    private string? _senha;
    private string? _senhaConfirmacao;

    [DisplayName("Primeiro nome")]
    [Required(ErrorMessage = "{0} é obrigatório")]
    [MinLength(2, ErrorMessage = "{0} deve ter no mínimo {1} caracteres")]
    [MaxLength(60, ErrorMessage = "{0} deve ter no máximo {1} caracteres")]
    [RegularExpression(@"^[\p{L}'\- ]+$", ErrorMessage = "{0} inválido")]
    public string? PrimeiroNome
    {
        get => _primeiroNome;
        set => _primeiroNome = string.IsNullOrEmpty(value) ? null : value;
    }

    [StringLength(80, MinimumLength = 2, ErrorMessage = "{0} deve ter entre {2} e {1} caracteres")]
    [RegularExpression(@"^[\p{L}'\- ]+$", ErrorMessage = "{0} inválido")]
    public string? Sobrenome
    {
        get => _sobrenome;
        set => _sobrenome = string.IsNullOrWhiteSpace(value) ? null : value;
    }

    [Required(ErrorMessage = "{0} é obrigatório")]
    [MaxLength(255, ErrorMessage = "{0} deve ter no máximo {1} caracteres")]
    [EmailAddress(ErrorMessage = "Formato de email inválido")]
    public string? Email
    {
        get => _email;
        set => _email = string.IsNullOrWhiteSpace(value) ? null : value;
    }

    [Required(ErrorMessage = "{0}} é obrigatória")]
    [MinLength(6, ErrorMessage = "{0} deve ter no mínimo {1} caracteres")]
    [MaxLength(100, ErrorMessage = "{0} deve ter no máximo {1} caracteres")]
    [RegularExpression(@"^\S+$", ErrorMessage = "{0} não pode conter espaços")]
    public string? Senha
    {
        get => _senha;
        set => _senha = string.IsNullOrEmpty(value) ? null : value;
    }

    [DisplayName("Confirmar senha")]
    [Required(ErrorMessage = "O campo '{0}' é obrigatório")]
    [Compare(nameof(Senha), ErrorMessage = "As senhas não coincidem")]
    public string? SenhaConfirmacao
    {
        get => _senhaConfirmacao;
        set => _senhaConfirmacao = string.IsNullOrEmpty(value) ? null : value;
    }

    [DisplayName("Permissão")]
    public PermissoesEnum Permissao { get; set; } = PermissoesEnum.LEITURA;

}
