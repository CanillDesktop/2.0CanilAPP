using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

public class ItemComEstoqueBaseModel
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IdItem { get; set; }

    public ItemNivelEstoqueModel ItemNivelEstoque { get; set; } = new();

    public ICollection<ItemEstoqueModel> ItensEstoque { get; set; } = [];

    public DateTime DataHoraInsercaoRegistro { get; set; } = DateTime.UtcNow;
}
