namespace Backend.DTOs.Estoque;

/// <summary>
/// Status exibidos na gestão de estoque (/estoque).
/// Não confundir com <c>ProdutosFiltroDTO.StatusEstoque</c> (ativo, sem_estoque, etc.).
/// </summary>
public static class EstoqueStatusOperacional
{
    public const string Ok = "ok";
    public const string Baixo = "baixo";
    public const string ProximoVencimento = "proximo_vencimento";
    public const string Critico = "critico";

    /// <summary>Janela (em dias) usada para classificar "próximo do vencimento".</summary>
    public const int DiasProximoVencimento = 30;

    public static bool IsValid(string? value) =>
        string.IsNullOrWhiteSpace(value)
        || value is Ok or Baixo or ProximoVencimento or Critico;
}
