using Backend.DTOs.Estoque;
using Backend.DTOs.Produtos;
using Backend.Models.Enums;
using Backend.Models.Estoque;
using System.Text.RegularExpressions;

namespace Backend.Models.Produtos;

public class ProdutosModel : ItemComEstoqueBaseModel
{
    public string Codigo { get; set; } = string.Empty;
    public string DescricaoSimples { get; set; } = string.Empty;
    public string? DescricaoDetalhada { get; set; }
    public UnidadeEnum Unidade { get; set; }
    public CategoriaEnum Categoria { get; set; }

    private static string GeraIdentificador(CategoriaEnum categoria)
    {
        var id = "PRD";
        var catString = categoria.ToString();
        var categoriaCompostaSN = catString.Contains('_', StringComparison.CurrentCulture);

        if (catString.Length < 3)
            id += catString[..];
        else
            id += catString[..3];

        if (categoriaCompostaSN)
        {
            var i = catString.IndexOf('_', StringComparison.CurrentCulture);
            id += catString.Substring(i + 1, 1);
        }

        var guid = Guid.NewGuid().ToString().Replace("-", "");
        guid = Regex.Replace(guid, @"\D", "");

        id += guid;

        return id;
    }


    public static implicit operator ProdutosModel(ProdutosCadastroDTO dto)
    {
        var codigoProduto = GeraIdentificador(dto.Categoria);

        return new ProdutosModel()
        {
            Codigo = codigoProduto,
            DescricaoSimples = dto.DescricaoSimples.ToLower(),
            DescricaoDetalhada = dto.DescricaoDetalhada?.ToLower(),
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
                    Codigo = codigoProduto,
                    DataEntrega = dto.DataEntrega,
                    DataValidade = dto.DataValidade,
                    Lote = dto.Lote,
                    NFe = dto.NFe,
                    Quantidade = dto.Quantidade
                }
            ]
        };
    }

    public static implicit operator ProdutosLeituraDTO(ProdutosModel model)
    {
        var itensEstoque = model.ItensEstoque ?? [];
        var nivelEstoque = model.ItemNivelEstoque;

        return new ProdutosLeituraDTO()
        {
            Id = model.Id,
            Codigo = model.Codigo,
            NomeOuDescricaoSimples = model.DescricaoSimples,
            DescricaoDetalhada = model.DescricaoDetalhada,
            Unidade = model.Unidade,
            Categoria = model.Categoria,
            ItemNivelEstoque = nivelEstoque,
            ItensEstoque = [.. itensEstoque.Select(e => (ItemEstoqueDTO)e)]
        };
    }
}
