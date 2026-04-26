using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Estoque
{
    public class ItemNivelEstoqueDTO
    {
        public int Id { get; set; }

        [Display(Name = "Nível mínimo de estoque")]
        public int NivelMinimoEstoque { get; set; }
    }
}
