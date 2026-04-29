using Backend.DTOs.Estoque;
using Backend.Models.Enums;
using Backend.Models.Interfaces;

namespace Backend.DTOs.Produtos
{
    public class ProdutosLeituraDTO : IEstoqueItem
    {
        public int Id { get; init; }
        public string Codigo { get; set; } = string.Empty;
        public string NomeOuDescricaoSimples { get; set; } = string.Empty;
        public string? DescricaoDetalhada { get; set; }
        public UnidadeEnum Unidade { get; set; }
        public CategoriaEnum Categoria { get; set; }
        public ItemNivelEstoqueDTO? ItemNivelEstoque { get; set; } = new();
        public ItemEstoqueDTO[]? ItensEstoque { get; set; } = [];
    }
}
