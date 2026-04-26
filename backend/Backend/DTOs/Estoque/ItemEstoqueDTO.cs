using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Estoque
{
    public class ItemEstoqueDTO
    {
        public ItemEstoqueDTO(int id, string codigo, string? lote, int quantidade, DateTime dataEntrega, string? nfe, DateTime? dataValidade)
        {
            Id = id;
            Codigo = codigo;
            Lote = lote;
            Quantidade = quantidade;
            DataEntrega = dataEntrega;
            NFe = nfe;
            DataValidade = dataValidade;
        }
        public int Id { get; set; }

        [Display(Name = "Código do item")]
        public string Codigo { get; set; } = string.Empty;
        public string? Lote { get; set; }
        public int Quantidade { get; set; }

        [Display(Name = "Data de entrega")]
        public DateTime DataEntrega { get; set; }

        [Display(Name = "NFe/DOC")]
        public string? NFe { get; set; } = string.Empty;

        [Display(Name = "Data de validade")]
        public DateTime? DataValidade { get; set; }
    }
}
