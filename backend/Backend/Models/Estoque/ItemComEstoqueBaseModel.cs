namespace Backend.Models.Estoque;

public abstract class ItemComEstoqueBaseModel : BaseModel
{
    public ICollection<ItemNivelEstoqueModel> ItensNivelEstoque { get; set; } = [];

    public ICollection<ItemEstoqueModel> ItensEstoque { get; set; } = [];

    public ItemNivelEstoqueModel? ObterNivelEstoque(int idUnidadeEstoque) =>
        ItensNivelEstoque.FirstOrDefault(n => n.IdUnidadeEstoque == idUnidadeEstoque && !n.IsDeleted);

    public IEnumerable<ItemEstoqueModel> ObterLotesAtivos(int idUnidadeEstoque) =>
        ItensEstoque.Where(e => e.IdUnidadeEstoque == idUnidadeEstoque && !e.IsDeleted);
}

