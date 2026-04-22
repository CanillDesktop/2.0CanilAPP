using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models.Estoque;

public abstract class ItemComEstoqueBaseModel : BaseModel
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int IdItem { get; set; }

    public ItemNivelEstoqueModel ItemNivelEstoque { get; set; } = new();

    public ICollection<ItemEstoqueModel> ItensEstoque { get; set; } = [];
}
