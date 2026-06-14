using Backend.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Insumos
{
    public class InsumosCadastroDTO
    {
        [Display(Name = "Descrição")]
        [Required(ErrorMessage = "{0} é obrigatória")]
        public string DescricaoSimplificada { get; set; } = string.Empty;

        [Display(Name = "Descrição detalhada")]
        [Required(ErrorMessage = "{0} é obrigatória")]
        public string DescricaoDetalhada { get; set; } = string.Empty;

        public int Quantidade { get; set; }

        [Display(Name = "Data de entrega")]
        public DateTime DataEntrega { get; set; }

        [Display(Name = "NFe/DOC")]
        public string? NFe { get; set; } = string.Empty;

        [Required(ErrorMessage = "{0} é obrigatória")]
        public UnidadeInsumosEnum Unidade { get; set; }

        [Display(Name = "Data de validade")]
        public DateTime? DataValidade { get; set; }

        [Display(Name = "Nível mínimo de estoque")]
        public int NivelMinimoEstoque { get; set; }
    }
}


