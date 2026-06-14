namespace Backend.DTOs.CodigoAcesso;

/// <summary>Dados para alteração do código de acesso (somente administrador).</summary>
public class AtualizarCodigoAcessoRequestDTO
{
    public string? Codigo { get; set; }
}
