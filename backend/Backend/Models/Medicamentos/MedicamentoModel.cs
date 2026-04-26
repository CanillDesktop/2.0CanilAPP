using Backend.DTOs.Estoque;
using Backend.DTOs.Medicamentos;
using Backend.Models.Enums;
using Backend.Models.Estoque;
using System.Text.RegularExpressions;

namespace Backend.Models.Medicamentos;

public class MedicamentosModel : ItemComEstoqueBaseModel
{
    public string Codigo { get; set; } = string.Empty;
    public PrioridadeEnum Prioridade { get; set; }
    public string? Descricao { get; set; } = string.Empty;
    public string Formula { get; set; } = string.Empty;
    public string NomeComercial { get; set; } = string.Empty;
    public PublicoAlvoMedicamentoEnum PublicoAlvo { get; set; }

    private static string GeraIdentificador()
    {
        var id = "MED";

        var guid = Guid.NewGuid().ToString().Replace("-", "");
        guid = Regex.Replace(guid, @"\D", "");

        id += guid;

        return id;
    }

    public static implicit operator MedicamentosModel(MedicamentoCadastroDTO dto)
    {
        var codigoMedicamento = GeraIdentificador();

        var itemEstoque = new ItemEstoqueModel()
        {
            Codigo = codigoMedicamento,
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

        return new MedicamentosModel()
        {
            Codigo = codigoMedicamento,
            Prioridade = dto.Prioridade,
            Descricao = dto.Descricao?.ToLower(),
            Formula = dto.Formula,
            NomeComercial = dto.NomeComercial.ToUpper(),
            PublicoAlvo = dto.PublicoAlvo,
            ItemNivelEstoque = nivelEstoque,
            ItensEstoque = [itemEstoque]
        };
    }

    public static implicit operator MedicamentoLeituraDTO(MedicamentosModel model)
    {
        var itensEstoque = model.ItensEstoque ?? [];
        var nivelEstoque = model.ItemNivelEstoque;

        return new MedicamentoLeituraDTO()
        {
            Id = model.Id,
            Codigo = model.Codigo,
            NomeOuDescricaoSimples = model.NomeComercial,
            Descricao = model.Descricao,
            Formula = model.Formula,
            PublicoAlvo = model.PublicoAlvo,
            ItemNivelEstoque = nivelEstoque,
            ItensEstoque = [.. itensEstoque.Select(e => (ItemEstoqueDTO)e)]
        };
    }
}
