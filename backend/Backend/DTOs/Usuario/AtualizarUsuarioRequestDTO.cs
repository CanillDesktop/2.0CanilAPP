using Backend.Models.Enums;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Usuario;

public class AtualizarUsuarioRequestDTO
{
    private string? _primeiroNome;
    private string? _sobrenome;
    private string? _email;

    [DisplayName("Primeiro nome")]
    [MinLength(2, ErrorMessage = "{0} deve ter no mínimo {1} caracteres")]
    [MaxLength(60, ErrorMessage = "{0} deve ter no máximo {1} caracteres")]
    public string? PrimeiroNome
    {
        get => _primeiroNome;
        set => _primeiroNome = string.IsNullOrWhiteSpace(value) ? null : value;
    }

    [MinLength(2, ErrorMessage = "{0} deve ter no mínimo {1} caracteres")]
    [MaxLength(100, ErrorMessage = "{0} deve ter no máximo {1} caracteres")]
    public string? Sobrenome
    {
        get => _sobrenome;
        set => _sobrenome = string.IsNullOrWhiteSpace(value) ? null : value;
    }

    [EmailAddress(ErrorMessage = "Formato de email inválido")]
    [MaxLength(255, ErrorMessage = "{0} deve ter no máximo {1} caracteres")]
    public string? Email
    {
        get => _email;
        set => _email = string.IsNullOrWhiteSpace(value) ? null : value;
    }

    [DisplayName("Permissão")]
    public PermissoesEnum? Permissao { get; set; }
}
