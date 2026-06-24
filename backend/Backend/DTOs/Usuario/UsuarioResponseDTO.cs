using Backend.DTOs.Estoque;
using Backend.Models.Enums;

namespace Backend.DTOs.Usuario;

public class UsuarioResponseDTO
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PrimeiroNome { get; set; } = string.Empty;
    public string? Sobrenome { get; set; }
    public PermissoesEnum Permissao { get; set; }
    public DateTime DataHoraCriacao { get; set; } = DateTime.UtcNow;
    public DateTime DataHoraAtualizacao { get; set; } = DateTime.UtcNow;
    public bool IsDeleted { get; set; } = false;
    public StatusUsuario Status { get; set; } = StatusUsuario.Ativo;
    public DateTime? InactivatedAt { get; set; }
    public string? InactivatedBy { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }
    public DateTime? ReactivatedAt { get; set; }
    public string? ReactivatedBy { get; set; }
    public int TokenVersion { get; set; } = 1;
    public List<UsuarioUnidadeEstoqueDTO> UnidadesEstoque { get; set; } = [];
}
