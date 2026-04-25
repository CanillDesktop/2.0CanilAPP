using Backend.Models.Enums;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Usuario;

public class UsuarioAtualizacaoRequestDTO
{
    [DisplayName("Primeiro nome")]
    [Required(ErrorMessage = "{0} é obrigatório")]
    [MinLength(2, ErrorMessage = "{0} deve ter no mínimo 2 caracteres")]
    [MaxLength(60, ErrorMessage = "{0} deve ter no máximo 60 caracteres")]
    public string PrimeiroNome { get; set; } = string.Empty;

    [DisplayName("Sobrenome")]
    [StringLength(80, MinimumLength = 2, ErrorMessage = "{0} deve ter entre 2 e 80 caracteres")]
    public string? Sobrenome { get; set; }

    /// <summary>Somente administrador alterando outro usuário; demais requisições ignoram.</summary>
    public PermissoesEnum? Permissao { get; set; }
}
