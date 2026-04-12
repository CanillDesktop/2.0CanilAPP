using Shared.DTOs.Estoque;
using Shared.DTOs.Produtos;
using Shared.Enums;

namespace Backend.Models.Produtos;

public class ProdutosModel : ItemComEstoqueBaseModel
{
    public ProdutosModel() { }

    public string CodProduto { get; set; } = string.Empty;

    public string? DescricaoSimples { get; set; }

    public DateTime? DataEntrega { get; init; }

    public string? NFe { get; set; }

    public string? DescricaoDetalhada { get; set; }

    public UnidadeEnum Unidade { get; set; }

    public CategoriaEnum Categoria { get; set; }

    public bool IsDeleted { get; set; } = false;

    public DateTime DataAtualizacao { get; set; } = DateTime.UtcNow;

    public static implicit operator ProdutosModel(ProdutosCadastroDTO dto)
    {
        return new ProdutosModel()
        {
            CodProduto = dto.CodProduto,
            DescricaoSimples = dto.DescricaoSimples,
            DescricaoDetalhada = dto.DescricaoDetalhada,
            Unidade = dto.Unidade,
            Categoria = dto.Categoria,
            ItemNivelEstoque = new()
            {
                NivelMinimoEstoque = dto.NivelMinimoEstoque
            },
            ItensEstoque =
            [
                new ItemEstoqueModel()
                {
                    CodItem = dto.CodProduto,
                    DataEntrega = dto.DataEntrega,
                    DataValidade = dto.DataValidade,
                    Lote = dto.Lote,
                    NFe = dto.NFe,
                    Quantidade = dto.Quantidade
                }
            ]
        };
    }

    public static implicit operator ProdutosCadastroDTO(ProdutosModel model)
    {
        var itemEstoque = model.ItensEstoque?.FirstOrDefault();
        var nivelEstoque = model.ItemNivelEstoque;

        return new ProdutosCadastroDTO()
        {
            CodProduto = model.CodProduto,
            DescricaoSimples = model.DescricaoSimples,
            DescricaoDetalhada = model.DescricaoDetalhada,
            Unidade = model.Unidade,
            Categoria = model.Categoria,
            NivelMinimoEstoque = nivelEstoque?.NivelMinimoEstoque ?? 0,
            DataEntrega = itemEstoque?.DataEntrega ?? DateTime.UtcNow,
            DataValidade = itemEstoque?.DataValidade,
            Lote = itemEstoque?.Lote,
            NFe = itemEstoque?.NFe,
            Quantidade = itemEstoque?.Quantidade ?? 0
        };
    }

    public static implicit operator ProdutosLeituraDTO(ProdutosModel model)
    {
        var itensEstoque = model.ItensEstoque ?? [];
        var nivelEstoque = model.ItemNivelEstoque;

        return new ProdutosLeituraDTO()
        {
            IdItem = model.IdItem,
            CodItem = model.CodProduto,
            NomeItem = model.DescricaoSimples,
            DescricaoDetalhada = model.DescricaoDetalhada,
            Unidade = model.Unidade,
            Categoria = model.Categoria,
            ItemNivelEstoque = nivelEstoque,
            ItensEstoque = [.. itensEstoque.Select(e => (ItemEstoqueDTO)e)]
        };
    }
}
