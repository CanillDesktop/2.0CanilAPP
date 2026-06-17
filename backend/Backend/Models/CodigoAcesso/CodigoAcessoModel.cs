using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models.CodigoAcesso;

/// <summary>
/// Código de acesso global usado no pré-login (primeiro acesso ao sistema).
/// É mantido como registro único (Id = 1).
/// </summary>
[Table("CodigoAcesso")]
public class CodigoAcessoModel
{
    /// <summary>Identificador do registro único de configuração.</summary>
    public const int IdRegistroUnico = 1;

    /// <summary>Valor padrão aplicado na carga inicial da base.</summary>
    public const string CodigoPadrao = "canil@acesso";

    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.None)]
    public int Id { get; set; } = IdRegistroUnico;

    [Required]
    [MaxLength(64)]
    public string Codigo { get; set; } = string.Empty;

    public DateTime DataHoraAtualizacao { get; set; } = DateTime.UtcNow;

    public string EditadoPor { get; set; } = string.Empty;
}
