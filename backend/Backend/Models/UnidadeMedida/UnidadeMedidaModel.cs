using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models.UnidadeMedida;

[Table("UnidadesMedida")]
public class UnidadeMedidaModel : BaseModel
{
    public string Nome { get; set; } = string.Empty;
    public string? Sigla { get; set; }
    public bool AplicavelProduto { get; set; }
    public bool AplicavelMedicamento { get; set; }
    public bool AplicavelInsumo { get; set; }
    public bool Ativa { get; set; } = true;
}
