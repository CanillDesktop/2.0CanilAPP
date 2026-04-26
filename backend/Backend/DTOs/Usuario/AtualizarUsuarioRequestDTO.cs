using Backend.Models.Enums;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Usuario;

public class AtualizarUsuarioRequestDTO
{
    [DisplayName("Primeiro nome")]
    [MinLength(2, ErrorMessage = "{0} deve ter no mínimo {1} caracteres")]
    [MaxLength(60, ErrorMessage = "{0} deve ter no máximo {1} caracteres")]
    public string? PrimeiroNome { get; set; }

    [MaxLength(100, ErrorMessage = "{0} deve ter no máximo {1} caracteres")]
    public string? Sobrenome { get; set; }

    [MaxLength(255, ErrorMessage = "{0} deve ter no máximo {1} caracteres")]
    public string? Email { get; set; }

    [DisplayName("Permissão")]
    public PermissoesEnum? Permissao { get; set; }
}
