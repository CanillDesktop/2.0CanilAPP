using Backend.DTOs.Estoque;
using Backend.DTOs.Insumos;
using Backend.Models.Enums;
using Backend.Models.Estoque;

namespace Backend.Models.Insumos;

public class InsumosModel : ItemComEstoqueBaseModel
{
    public string CodInsumo { get; set; } = string.Empty;

    public required string DescricaoSimplificada { get; set; }

    public required string DescricaoDetalhada { get; set; }

    public UnidadeInsumosEnum Unidade { get; set; }


    public static implicit operator InsumosModel(InsumosCadastroDTO dto)
    {
        var itemEstoque = new ItemEstoqueModel()
        {
            CodItem = dto.CodInsumo,
            DataEntrega = dto.DataEntrega,
            DataValidade = dto.DataValidade,
            Lote = dto.Lote,
            NFe = dto.NFe,
            Quantidade = dto.Quantidade
        };

        var nivelEstoque = new ItemNivelEstoqueModel()
        {
            NivelMinimoEstoque = dto.NivelMinimoEstoque
        };

        return new InsumosModel()
        {
            CodInsumo = dto.CodInsumo,
            DescricaoSimplificada = dto.DescricaoSimplificada,
            DescricaoDetalhada = dto.DescricaoDetalhada,
            Unidade = dto.Unidade,
            ItemNivelEstoque = nivelEstoque,
            ItensEstoque = [itemEstoque]
        };
    }

    public static implicit operator InsumosCadastroDTO(InsumosModel model)
    {
        var itemEstoque = model.ItensEstoque?.FirstOrDefault();
        var nivelEstoque = model.ItemNivelEstoque;

        return new InsumosCadastroDTO()
        {
            CodInsumo = model.CodInsumo,
            DescricaoSimplificada = model.DescricaoSimplificada,
            DescricaoDetalhada = model.DescricaoDetalhada,
            Lote = itemEstoque?.Lote,
            Quantidade = itemEstoque?.Quantidade ?? 0,
            DataEntrega = itemEstoque?.DataEntrega ?? DateTime.UtcNow,
            NFe = itemEstoque?.NFe,
            NivelMinimoEstoque = nivelEstoque?.NivelMinimoEstoque ?? 0,
            DataValidade = itemEstoque?.DataValidade,
            Unidade = model.Unidade
        };
    }

    public static implicit operator InsumosLeituraDTO(InsumosModel model)
    {
        var itensEstoque = model.ItensEstoque ?? [];
        var nivelEstoque = model.ItemNivelEstoque;

        return new InsumosLeituraDTO()
        {
            IdItem = model.IdItem,
            CodItem = model.CodInsumo,
            NomeItem = model.DescricaoSimplificada,
            DescricaoDetalhada = model.DescricaoDetalhada,
            Unidade = model.Unidade,
            ItemNivelEstoque = nivelEstoque,
            ItensEstoque = [.. itensEstoque.Select(e => (ItemEstoqueDTO)e)]
        };
    }
}
