using Backend.Models.Enums;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Usuario;

public class UsuarioRequestDTO
{
    [DisplayName("Primeiro nome")]
    [Required(ErrorMessage = "{0} é obrigatório")]
    public string PrimeiroNome { get; set; } = string.Empty;

    public string? Sobrenome { get; set; }

    [Required(ErrorMessage = "{0} é obrigatório")]
    [EmailAddress(ErrorMessage = "Formato de email inválido")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "{0} é obrigatória")]
    [MinLength(6, ErrorMessage = "Senha deve ter no mínimo 6 caracteres")]
    public string Senha { get; set; } = string.Empty;

    [DisplayName("Permissão")]
    public PermissoesEnum Permissao { get; set; } = PermissoesEnum.LEITURA;

    [DisplayName("Ativo")]
    public bool IsDeleted { get; set; } = false;
}