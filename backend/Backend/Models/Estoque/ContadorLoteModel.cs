using System.ComponentModel.DataAnnotations;

namespace Backend.Models.Estoque;

/// <summary>
/// Contador sequencial de lotes por tipo de item (PRO/INS/MED).
/// Cada incremento é único e nunca reutilizado, mesmo após exclusão de itens.
/// </summary>
public class ContadorLoteModel
{
    /// <summary>Prefixo do tipo do item: PRO, INS ou MED.</summary>
    [Key]
    [MaxLength(8)]
    public string Tipo { get; set; } = string.Empty;

    /// <summary>Último número sequencial emitido para o tipo.</summary>
    public long UltimoNumero { get; set; }

    /// <summary>Token de concorrência otimista para evitar atualização perdida sob concorrência.</summary>
    public long Versao { get; set; }
}
