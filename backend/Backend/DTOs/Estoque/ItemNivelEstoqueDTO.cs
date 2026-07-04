using System.ComponentModel.DataAnnotations;
using Backend.Models.Estoque;

namespace Backend.DTOs.Estoque
{
    public class ItemNivelEstoqueDTO
    {
        public int Id { get; set; }
        public int IdUnidadeEstoque { get; set; } = UnidadeEstoqueIds.Secretaria;

        [Display(Name = "Nível mínimo de estoque")]
        public int NivelMinimoEstoque { get; set; }
    }
}
