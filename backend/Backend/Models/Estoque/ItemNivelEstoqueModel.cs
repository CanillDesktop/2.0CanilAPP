using Backend.DTOs.Estoque;
using System.Text.Json.Serialization;

namespace Backend.Models.Estoque;

public class ItemNivelEstoqueModel : BaseModel
{
    public int IdUnidadeEstoque { get; set; } = UnidadeEstoqueIds.Secretaria;
    public int NivelMinimoEstoque { get; set; }

    [JsonIgnore]
    public ItemComEstoqueBaseModel ItemBase { get; set; } = null!;

    [JsonIgnore]
    public UnidadeEstoqueModel? UnidadeEstoque { get; set; }

    public static implicit operator ItemNivelEstoqueDTO(ItemNivelEstoqueModel? model)
    {
        if (model is null)
            return new ItemNivelEstoqueDTO();

        return new ItemNivelEstoqueDTO
        {
            Id = model.Id,
            IdUnidadeEstoque = model.IdUnidadeEstoque,
            NivelMinimoEstoque = model.NivelMinimoEstoque,
        };
    }

    public static implicit operator ItemNivelEstoqueModel(ItemNivelEstoqueDTO? dto)
    {
        if (dto is null)
            return new ItemNivelEstoqueModel();

        return new ItemNivelEstoqueModel
        {
            Id = dto.Id,
            IdUnidadeEstoque = dto.IdUnidadeEstoque,
            NivelMinimoEstoque = dto.NivelMinimoEstoque,
        };
    }
}
