using Backend.DTOs.Estoque;
using System.Text.Json.Serialization;

namespace Backend.Models.Estoque;

public class ItemNivelEstoqueModel : BaseModel
{
    public int NivelMinimoEstoque { get; set; }

    [JsonIgnore]
    public ItemComEstoqueBaseModel ItemBase { get; set; } = null!;

    public static implicit operator ItemNivelEstoqueDTO(ItemNivelEstoqueModel model)
    {
        return new ItemNivelEstoqueDTO()
        {
            Id = model.Id,
            NivelMinimoEstoque = model.NivelMinimoEstoque
        };
    }

    public static implicit operator ItemNivelEstoqueModel(ItemNivelEstoqueDTO dto)
    {
        return new ItemNivelEstoqueModel()
        {
            Id = dto.Id,
            NivelMinimoEstoque = dto.NivelMinimoEstoque
        };
    }
}
