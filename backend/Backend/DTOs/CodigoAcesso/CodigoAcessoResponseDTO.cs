namespace Backend.DTOs.CodigoAcesso;

/// <summary>Código de acesso atual do sistema (visível apenas para administradores).</summary>
public class CodigoAcessoResponseDTO
{
    public string Codigo { get; set; } = string.Empty;
    public DateTime AtualizadoEm { get; set; }
}
