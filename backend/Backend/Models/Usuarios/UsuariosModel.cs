using Backend.DTOs;
using Backend.Models.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Backend.Models.Usuarios;

[Table("Usuarios")]
public class UsuariosModel
{
    public UsuariosModel() { }

    public UsuariosModel(string? primeiroNome, string? sobrenome, string email, string? hashSenha, PermissoesEnum? permissao)
    {
        PrimeiroNome = primeiroNome;
        Sobrenome = sobrenome;
        Email = email;
        HashSenha = hashSenha;
        Permissao = permissao;
        DataHoraCriacao = DateTime.UtcNow;
    }

    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public string? PrimeiroNome { get; set; }

    public string? Sobrenome { get; set; }

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [JsonIgnore]
    public string? HashSenha { get; set; }

    [EnumDataType(typeof(PermissoesEnum))]
    public PermissoesEnum? Permissao { get; set; }

    [JsonIgnore]
    public string? RefreshToken { get; set; } = string.Empty;

    [JsonIgnore]
    public DateTime DataHoraExpiracaoRefreshToken { get; set; }

    public DateTime DataHoraCriacao { get; init; } = DateTime.UtcNow;

    public DateTime DataAtualizacao { get; set; } = DateTime.UtcNow;

    public UsuarioResponseDTO ToDTO()
    {
        return new UsuarioResponseDTO
        {
            Id = Id,
            Email = Email,
            Nome = PrimeiroNome ?? string.Empty,
            Sobrenome = Sobrenome ?? string.Empty,
            Permissao = Permissao ?? PermissoesEnum.LEITURA,
            CognitoSub = Id.ToString()
        };
    }

    public static UsuariosModel FromDTO(UsuarioRequestDTO dto)
    {
        return new UsuariosModel
        {
            Id = dto.Id ?? 0,
            PrimeiroNome = dto.Nome,
            Sobrenome = dto.Sobrenome,
            Email = dto.Email,
            HashSenha = dto.Senha,
            Permissao = dto.Permissao,
            DataAtualizacao = DateTime.UtcNow
        };
    }

    public static implicit operator UsuarioResponseDTO?(UsuariosModel? model)
    {
        return model?.ToDTO();
    }
}
