using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models.Cargos;

[Table("Cargos")]
public class CargoModel : BaseModel
{
    public const int IdAdministrador = 1;
    public const int IdGrupoPadrao = 2;

    /// <summary>Alias legado do id do grupo padrão (antigo perfil Leitura).</summary>
    public const int IdLeitura = IdGrupoPadrao;

    public const string NomeGrupoPadrao = "Grupo Padrão";

    [Required]
    [MaxLength(80)]
    public string Nome { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Descricao { get; set; }

    /// <summary>
    /// Cargo com acesso total (equivalente ao antigo perfil Administrador).
    /// </summary>
    public bool EhAdministradorSistema { get; set; }

    /// <summary>
    /// Cargos padrão do sistema (Administrador, Grupo Padrão) não podem ser excluídos.
    /// </summary>
    public bool EhSistema { get; set; }
}
