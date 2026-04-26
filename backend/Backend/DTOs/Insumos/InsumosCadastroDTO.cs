using Backend.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Insumos
{
    public class InsumosCadastroDTO
    {
        public InsumosCadastroDTO()
        {
        }
        public InsumosCadastroDTO(string descricaoSimplificada, string? descricaoDetalhada, string? lote, int quantidade, DateTime dataEntrega, string? nFE, UnidadeInsumosEnum unidade,
            DateTime? dataValidade, int nivelMinimoEstoque)
        {
            DescricaoSimplificada = descricaoSimplificada;
            DescricaoDetalhada = descricaoDetalhada;
            Lote = lote;
            Quantidade = quantidade;
            DataEntrega = dataEntrega;
            NFe = nFE;
            Unidade = unidade;
            DataValidade = dataValidade;
            NivelMinimoEstoque = nivelMinimoEstoque;
        }

        [Display(Name = "Descrição")]
        [Required(ErrorMessage = "{0} é obrigatória")]
        public string DescricaoSimplificada { get; set; } = string.Empty;

        [Display(Name = "Descrição detalhada")]
        public string? DescricaoDetalhada { get; set; }

        [Required(ErrorMessage = "{0} é obrigatório")]
        public string? Lote { get; set; }

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


