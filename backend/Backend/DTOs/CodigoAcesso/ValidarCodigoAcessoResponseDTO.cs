namespace Backend.DTOs.CodigoAcesso;

/// <summary>Resultado da validação do código de acesso no pré-login.</summary>
public class ValidarCodigoAcessoResponseDTO
{
    public bool Valido { get; set; }

    /// <summary>Versão atual do código (para o cliente saber a qual valor o pré-login se refere).</summary>
    public string Versao { get; set; } = string.Empty;
}
