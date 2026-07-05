using Backend.DTOs.Estoque;
using System.Text.Json.Serialization;
using Backend.Utils;

namespace Backend.Models.Estoque;

public class ItemEstoqueModel : BaseModel
{
    private string? _lote = string.Empty;

    public string Codigo { get; set; } = string.Empty;
    public int IdUnidadeEstoque { get; set; } = UnidadeEstoqueIds.Secretaria;
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

    /// <summary>
    /// Token de concorrência otimista por linha de estoque (incrementado a cada alteração bem-sucedida).
    /// </summary>
    public long Versao { get; set; }

    public DateTime DataEntrega { get; set; }
    public string? NFe { get; set; } = string.Empty;
    public DateTime? DataValidade { get; set; }

    [JsonIgnore]
    public ItemComEstoqueBaseModel? ItemBase { get; set; }

    [JsonIgnore]
    public UnidadeEstoqueModel? UnidadeEstoque { get; set; }


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
            model.DataValidade,
            model.IdUnidadeEstoque,
            model.DataHoraCriacao
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
            DataValidade = dto.DataValidade,
            IdUnidadeEstoque = dto.IdUnidadeEstoque,
        };
    }
}
