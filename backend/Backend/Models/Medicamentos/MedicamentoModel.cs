using Backend.DTOs.Estoque;
using Backend.DTOs.Medicamentos;
using Backend.Models.Enums;

namespace Backend.Models.Medicamentos;

public class MedicamentosModel : ItemComEstoqueBaseModel
{
    public string CodMedicamento { get; set; } = string.Empty;

    public PrioridadeEnum Prioridade { get; set; }

    public required string DescricaoMedicamento { get; set; }

    public required string Formula { get; set; }

    public required string NomeComercial { get; set; }

    public PublicoAlvoMedicamentoEnum PublicoAlvo { get; set; }

    public bool IsDeleted { get; set; } = false;

    public DateTime DataAtualizacao { get; set; } = DateTime.UtcNow;

    public static implicit operator MedicamentosModel(MedicamentoCadastroDTO dto)
    {
        var itemEstoque = new ItemEstoqueModel()
        {
            CodItem = dto.CodMedicamento,
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
            CodMedicamento = dto.CodMedicamento,
            Prioridade = dto.Prioridade,
            DescricaoMedicamento = dto.DescricaoMedicamento,
            Formula = dto.Formula,
            NomeComercial = dto.NomeComercial,
            PublicoAlvo = dto.PublicoAlvo,
            ItemNivelEstoque = nivelEstoque,
            ItensEstoque = [itemEstoque]
        };
    }

    public static implicit operator MedicamentoCadastroDTO(MedicamentosModel model)
    {
        var itemEstoque = model.ItensEstoque?.FirstOrDefault();
        var nivelEstoque = model.ItemNivelEstoque;

        return new MedicamentoCadastroDTO()
        {
            CodMedicamento = model.CodMedicamento,
            Prioridade = model.Prioridade,
            DescricaoMedicamento = model.DescricaoMedicamento,
            Lote = itemEstoque?.Lote,
            Quantidade = itemEstoque?.Quantidade ?? 0,
            DataEntrega = itemEstoque?.DataEntrega ?? DateTime.UtcNow,
            NFe = itemEstoque?.NFe,
            Formula = model.Formula,
            NomeComercial = model.NomeComercial,
            PublicoAlvo = model.PublicoAlvo,
            NivelMinimoEstoque = nivelEstoque?.NivelMinimoEstoque ?? 0,
            DataValidade = itemEstoque?.DataValidade
        };
    }

    public static implicit operator MedicamentoLeituraDTO(MedicamentosModel model)
    {
        var itensEstoque = model.ItensEstoque ?? [];
        var nivelEstoque = model.ItemNivelEstoque;

        return new MedicamentoLeituraDTO()
        {
            IdItem = model.IdItem,
            CodItem = model.CodMedicamento,
            NomeItem = model.NomeComercial,
            DescricaoMedicamento = model.DescricaoMedicamento,
            Formula = model.Formula,
            PublicoAlvo = model.PublicoAlvo,
            ItemNivelEstoque = nivelEstoque,
            ItensEstoque = [.. itensEstoque.Select(e => (ItemEstoqueDTO)e)]
        };
    }
}
