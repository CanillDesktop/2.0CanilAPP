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

    public string PrimeiroNome { get; set; } = string.Empty;
    public string? Sobrenome { get; set; }
    public string Email { get; set; } = string.Empty;
    public string HashSenha { get; set; } = string.Empty;

    [EnumDataType(typeof(PermissoesEnum))]
    public PermissoesEnum Permissao { get; set; }

    /// <summary>
    /// Permite cadastrar/editar o catálogo de unidades de medida (Kg, Comprimido, etc.).
    /// Administradores sempre têm acesso; usuários comuns só com esta flag.
    /// </summary>
    public bool PodeGerenciarUnidadesMedida { get; set; }

    [EnumDataType(typeof(StatusUsuario))]
    public StatusUsuario Status { get; set; } = StatusUsuario.Ativo;

    public DateTime? InactivatedAt { get; set; }
    public string? InactivatedBy { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }
    public DateTime? ReactivatedAt { get; set; }
    public string? ReactivatedBy { get; set; }

    /// <summary>
    /// Incrementado a cada evento que deve invalidar JWTs em circulação.
    /// </summary>
    public int TokenVersion { get; set; } = 1;

    public ICollection<RefreshToken> RefreshTokens { get; set; } = [];

    public void SincronizarIsDeleted() => IsDeleted = Status != StatusUsuario.Ativo;

    public static implicit operator UsuarioResponseDTO(UsuariosModel model)
    {
        return new UsuarioResponseDTO
        {
            Id = model.Id,
            Email = model.Email,
            PrimeiroNome = model.PrimeiroNome,
            Sobrenome = model.Sobrenome,
            Permissao = model.Permissao,
            PodeGerenciarUnidadesMedida = model.PodeGerenciarUnidadesMedida || model.Permissao == PermissoesEnum.ADMIN,
            DataHoraCriacao = model.DataHoraCriacao,
            DataHoraAtualizacao = model.DataHoraAtualizacao,
            IsDeleted = model.IsDeleted,
            Status = model.Status,
            InactivatedAt = model.InactivatedAt,
            InactivatedBy = model.InactivatedBy,
            DeletedAt = model.DeletedAt,
            DeletedBy = model.DeletedBy,
            ReactivatedAt = model.ReactivatedAt,
            ReactivatedBy = model.ReactivatedBy,
            TokenVersion = model.TokenVersion
        };
    }

    public static implicit operator UsuariosModel(AtualizarUsuarioRequestDTO dto)
    {
        return new UsuariosModel
        {
            PrimeiroNome = dto.PrimeiroNome?.ToLower().Trim() ?? string.Empty,
            Sobrenome = dto.Sobrenome?.ToLower().Trim(),
            Email = dto.Email?.ToLower().Trim() ?? string.Empty,
            Permissao = dto.Permissao ?? PermissoesEnum.ADMIN
        };
    }

    public static implicit operator UsuariosModel(UsuarioCriacaoComConfirmacaoRequestDTO dto)
    {
        return new UsuariosModel
        {
            PrimeiroNome = dto.PrimeiroNome?.ToLower().Trim() ?? string.Empty,
            Sobrenome = dto.Sobrenome?.ToLower().Trim(),
            Email = dto.Email?.ToLower().Trim() ?? string.Empty,
            HashSenha = dto.Senha ?? string.Empty,
            Permissao = dto.Permissao
        };
    }
}
