using Backend.DTOs.Estoque;
using Backend.DTOs.Insumos;
using Backend.Models.Enums;
using Backend.Models.Estoque;
using System.Text.RegularExpressions;

namespace Backend.Models.Insumos;

public class InsumosModel : ItemComEstoqueBaseModel
{
    public string Codigo { get; set; } = string.Empty;
    public string DescricaoSimplificada { get; set; } = string.Empty;
    public string DescricaoDetalhada { get; set; } = string.Empty;
    public UnidadeInsumosEnum Unidade { get; set; }

    private static string GeraIdentificador()
    {
        var id = "INS";

        var guid = Guid.NewGuid().ToString().Replace("-", "");
        guid = Regex.Replace(guid, @"\D", "");

        id += guid;

        return id;
    }


    public static implicit operator InsumosModel(InsumosCadastroDTO dto)
    {
        var codigoInsumo = GeraIdentificador();

        return new InsumosModel()
        {
            Codigo = codigoInsumo,
            DescricaoSimplificada = dto.DescricaoSimplificada.ToLower(),
            DescricaoDetalhada = dto.DescricaoDetalhada.ToLower(),
            Unidade = dto.Unidade,
            ItensNivelEstoque = dto.NivelMinimoEstoque > 0
                ? [new ItemNivelEstoqueModel { NivelMinimoEstoque = dto.NivelMinimoEstoque }]
                : [],
            ItensEstoque = [],
        };
    }

    public static implicit operator InsumosLeituraDTO(InsumosModel model)
    {
        var itensEstoque = model.ItensEstoque ?? [];
        var nivelEstoque = model.ItensNivelEstoque.FirstOrDefault();

        return new InsumosLeituraDTO()
        {
            Id = model.Id,
            Codigo = model.Codigo,
            NomeOuDescricaoSimples = model.DescricaoSimplificada,
            DescricaoDetalhada = model.DescricaoDetalhada,
            Unidade = model.Unidade,
            ItemNivelEstoque = nivelEstoque,
            ItensEstoque = [.. itensEstoque.Select(e => (ItemEstoqueDTO)e)]
        };
    }
}
