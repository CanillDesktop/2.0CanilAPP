using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Estoque
{
    public class ItemNivelEstoqueDTO
    {
        public int IdItem { get; set; }

        [Display(Name = "Nível mínimo estoque")]
        public int NivelMinimoEstoque { get; set; }
    }
}
