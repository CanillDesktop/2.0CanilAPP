namespace Backend.Models.Estoque;

public abstract class ItemComEstoqueBaseModel : BaseModel
{
    public ItemNivelEstoqueModel ItemNivelEstoque { get; set; } = new();

    public ICollection<ItemEstoqueModel> ItensEstoque { get; set; } = [];
}
