using Backend.DTOs.Estoque;
using Backend.Models.Enums;
using Backend.Models.Interfaces;

namespace Backend.DTOs.Insumos
{
    public class InsumosLeituraDTO : IEstoqueItem
    {
        public int Id { get; init; }
        public string Codigo { get; set; } = string.Empty;

        public string NomeOuDescricaoSimples { get; set; } = string.Empty;
        public string? DescricaoDetalhada { get; set; }
        public UnidadeInsumosEnum Unidade { get; set; }
        public ItemNivelEstoqueDTO? ItemNivelEstoque { get; set; } = new();
        public ItemEstoqueDTO[]? ItensEstoque { get; set; } = [];
    }
}
