using System.ComponentModel.DataAnnotations;
using Backend.Models.Estoque;

namespace Backend.DTOs.Estoque
{
    public class ItemEstoqueDTO
    {
        public ItemEstoqueDTO(
            int id,
            string codigo,
            string? lote,
            int quantidade,
            DateTime dataEntrega,
            string? nfe,
            DateTime? dataValidade,
            int idUnidadeEstoque = UnidadeEstoqueIds.Secretaria,
            DateTime? dataHoraCriacao = null)
        {
            Id = id;
            Codigo = codigo;
            Lote = lote;
            Quantidade = quantidade;
            DataEntrega = dataEntrega;
            NFe = nfe;
            DataValidade = dataValidade;
            IdUnidadeEstoque = idUnidadeEstoque;
            DataHoraCriacao = dataHoraCriacao;
        }

        public ItemEstoqueDTO() { }

        public int Id { get; set; }

        [Display(Name = "Código do item")]
        public string Codigo { get; set; } = string.Empty;
        public string? Lote { get; set; }
        public int Quantidade { get; set; }
        public int IdUnidadeEstoque { get; set; } = UnidadeEstoqueIds.Secretaria;

        [Display(Name = "Data de entrega")]
        public DateTime DataEntrega { get; set; }

        [Display(Name = "NFe/DOC")]
        public string? NFe { get; set; } = string.Empty;

        [Display(Name = "Data de validade")]
        public DateTime? DataValidade { get; set; }

        public DateTime? DataHoraCriacao { get; set; }
    }
}
