using Backend.DTOs.Usuario;
using Backend.Models.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models.Usuarios;

[Table("Usuarios")]
public class UsuariosModel : BaseModel
{
    public UsuariosModel() { }

    public UsuariosModel(string primeiroNome, string? sobrenome, string email, string hashSenha, PermissoesEnum permissao)
    {
        PrimeiroNome = primeiroNome;
        Sobrenome = sobrenome;
        Email = email;
        HashSenha = hashSenha;
        Permissao = permissao;
    }

    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public string PrimeiroNome { get; set; } = string.Empty;

    public string? Sobrenome { get; set; }

    public string Email { get; set; } = string.Empty;

    public string HashSenha { get; set; } = string.Empty;

    [EnumDataType(typeof(PermissoesEnum))]
    public PermissoesEnum Permissao { get; set; }

    public ICollection<RefreshToken> RefreshTokens { get; set; } = [];

    
    public static implicit operator UsuarioResponseDTO(UsuariosModel model)
    {
        return new UsuarioResponseDTO
        {
            Id = model.Id,
            Email = model.Email,
            PrimeiroNome = model.PrimeiroNome,
            Sobrenome = model.Sobrenome,
            Permissao = model.Permissao,
            DataHoraCriacao = model.DataHoraCriacao,
            DataHoraAtualizacao = model.DataHoraAtualizacao,
            IsDeleted = model.IsDeleted
        };
    }

    public static implicit operator UsuariosModel(UsuarioRequestDTO dto)
    {
        return new UsuariosModel
        {
            PrimeiroNome = dto.PrimeiroNome,
            Sobrenome = dto.Sobrenome,
            Email = dto.Email,
            HashSenha = dto.Senha,
            Permissao = dto.Permissao,
            DataHoraAtualizacao = DateTime.UtcNow,
            IsDeleted = dto.IsDeleted
        };
    }
}
