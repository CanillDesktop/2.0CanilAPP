using Backend.Models.Estoque;
using Backend.Models.Permissoes;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models.Cargos;

[Table("CargosPermissoes")]
public class CargoPermissaoModel
{
    public int Id { get; set; }

    public int IdCargo { get; set; }

    public int IdPermissao { get; set; }

    public int? IdUnidadeEstoque { get; set; }

    public CargoModel Cargo { get; set; } = null!;

    public PermissaoModel Permissao { get; set; } = null!;

    public UnidadeEstoqueModel? UnidadeEstoque { get; set; }
}
