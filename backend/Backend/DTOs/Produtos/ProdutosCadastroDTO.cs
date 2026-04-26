using Backend.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Produtos
{
    public class ProdutosCadastroDTO
    {
        [Display(Name = "Descrição")]
        [Required(ErrorMessage = "{0} é obrigatória")]
        public string DescricaoSimples { get; set; } = string.Empty;

        [Display(Name = "Descrição detalhada")]
        public string? DescricaoDetalhada { get; set; }

        [Required(ErrorMessage = "{0} é obrigatória")]
        public UnidadeEnum Unidade { get; set; }

        [Required(ErrorMessage = "{0} é obrigatória")]
        public CategoriaEnum Categoria { get; set; }

        [Required(ErrorMessage = "{0} é obrigatório")]
        public string? Lote { get; set; } = string.Empty;

        public int Quantidade { get; set; }

        [Display(Name = "Data de Entrega")]
        public DateTime DataEntrega { get; set; }

        [Display(Name = "NFe/DOC")]
        public string? NFe { get; set; } = string.Empty;

        [Display(Name = "Data de validade")]
        public DateTime? DataValidade { get; set; }

        [Display(Name = "Nível mínimo de estoque")]
        public int NivelMinimoEstoque { get; set; }
    }
}
