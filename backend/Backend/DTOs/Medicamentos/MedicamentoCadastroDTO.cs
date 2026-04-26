using Backend.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Medicamentos
{
   public class MedicamentoCadastroDTO
    {
        public MedicamentoCadastroDTO() 
        {
        }
        public MedicamentoCadastroDTO(PrioridadeEnum prioridade, string? descricao, string? lote, DateTime dataEntrega, string formula, string nomeComercial, PublicoAlvoMedicamentoEnum publicoAlvo,
            string? nFe, DateTime? dataValidade, int quantidade = 0, int nivelMinimoEstoque = 0)
        {
            Prioridade = prioridade;
            Descricao = descricao;
            Lote = lote;
            DataEntrega = dataEntrega;
            Formula = formula;
            NomeComercial = nomeComercial;
            PublicoAlvo = publicoAlvo;
            Quantidade = quantidade;
            NFe = nFe;
            DataValidade = dataValidade;
            NivelMinimoEstoque = nivelMinimoEstoque;
        }

        [Required(ErrorMessage = "{0} é obrigatória")]
        public PrioridadeEnum Prioridade { get; set; }

        [Display(Name = "Descrição")]
        public string? Descricao { get; set; }

        [Display(Name = "Lote")]
        [Required(ErrorMessage = "{0} é obrigatório")]
        public string? Lote { get; set; } = string.Empty;

        public int Quantidade { get; set; }

        [Display(Name = "Data de entrega")]
        public DateTime DataEntrega { get; set; }

        [Display(Name = "NFe/DOC")]
        public string? NFe { get; set; } = string.Empty;

        [Display(Name = "Fórmula")]
        [Required(ErrorMessage = "{0} é obrigatória")]
        public string Formula { get; set; } = string.Empty;

        [Display(Name = "Nome comercial")]
        [Required(ErrorMessage = "{0} é obrigatório")]
        public string NomeComercial { get; set; } = string.Empty;

        [Display(Name = "Público alvo")]
        [Required(ErrorMessage = "{0} é obrigatório")]
        public PublicoAlvoMedicamentoEnum PublicoAlvo { get; set; }

        [Display(Name = "Data de validade")]
        public DateTime? DataValidade { get; set; }

        [Display(Name = "Nível mínimo de estoque")]
        public int NivelMinimoEstoque { get; set; }
    }
}
