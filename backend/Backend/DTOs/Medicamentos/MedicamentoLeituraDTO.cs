using Backend.DTOs.Estoque;
using Backend.Models.Enums;
using Backend.Models.Interfaces;

namespace Backend.DTOs.Medicamentos
{
    public class MedicamentoLeituraDTO : IEstoqueItem
    {
        public int Id { get; init; }
        public string Codigo { get; set; } = string.Empty;
        public string NomeOuDescricaoSimples { get; set; } = string.Empty;
        public PrioridadeEnum Prioridade { get; set; }
        public string? Descricao { get; set; }
        public string Formula { get; set; } = string.Empty;
        public PublicoAlvoMedicamentoEnum PublicoAlvo { get; set; }
        public ItemNivelEstoqueDTO? ItemNivelEstoque { get; set; } = new();
        public ItemEstoqueDTO[]? ItensEstoque { get; set; } = [];
    }
}
