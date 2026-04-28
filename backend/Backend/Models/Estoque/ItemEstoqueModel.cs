using Backend.DTOs.Estoque;
using System.Text.Json.Serialization;

namespace Backend.Models.Estoque;

public class ItemEstoqueModel : BaseModel
{
    private string? _lote = string.Empty;

    public string Codigo { get; set; } = string.Empty;
    public string? Lote
    {
        get => _lote;
        set
        {
            if (string.IsNullOrWhiteSpace(value))
                _lote = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString();
            else
                _lote = value;
        }
    }
    public int Quantidade { get; set; }
    public DateTime DataEntrega { get; set; }
    public string? NFe { get; set; } = string.Empty;
    public DateTime? DataValidade { get; set; }

    [JsonIgnore]
    public ItemComEstoqueBaseModel? ItemBase { get; set; }


    public static implicit operator ItemEstoqueDTO(ItemEstoqueModel model)
    {
        return new ItemEstoqueDTO
        (
            model.Id,
            model.Codigo,
            model.Lote,
            model.Quantidade,
            model.DataEntrega,
            model.NFe,
            model.DataValidade
        );
    }

    public static implicit operator ItemEstoqueModel(ItemEstoqueDTO dto)
    {
        return new ItemEstoqueModel()
        {
            Id = dto.Id,
            Codigo = dto.Codigo,
            Lote = dto.Lote,
            Quantidade = dto.Quantidade,
            DataEntrega = dto.DataEntrega,
            NFe = dto.NFe,
            DataValidade = dto.DataValidade
        };
    }
}
