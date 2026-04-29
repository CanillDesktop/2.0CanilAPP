using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Estoque
{
    public class RetiradaEstoqueDTO
    {
        [Display(Name = "Código")]
        [Required(ErrorMessage = "{0} é obrigatório")]
        public string Codigo { get; set; } = string.Empty;

        [Display(Name = "Nome/descrição do recurso")]
        [Required(ErrorMessage = "{0} é obrigatório")]
        public string NomeOuDescricaoSimples { get; set; } = string.Empty;

        [Required(ErrorMessage = "{0} é obrigatório")]
        public string Lote { get; set; } = string.Empty;

        [Required(ErrorMessage = "O nome do usuário retirando o recurso não pode ser vazio")]
        public string De { get; set; } = string.Empty;

        [Required(ErrorMessage = "O nome da pessoa a receber o recurso não pode ser vazio")]
        public string Para { get; set; } = string.Empty;

        [Required(ErrorMessage = "{0} é obrigatória")]
        public int Quantidade { get; set; }
        public DateTime DataHoraRetirada { get; set; } = DateTime.UtcNow;
    }
}
