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
    public DateTime DataHoraAtualizacao { get; set; }
    public bool IsDeleted { get; set; } = false;
}