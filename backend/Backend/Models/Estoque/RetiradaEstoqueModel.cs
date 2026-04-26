using Backend.DTOs.Estoque;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models.Estoque;

public class RetiradaEstoqueModel
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string NomeOuDescricaoSimples { get; set; } = string.Empty;
    public int Quantidade { get; set; }
    public string Lote { get; set; } = string.Empty;
    public string De { get; set; } = string.Empty;
    public string Para { get; set; } = string.Empty;
    public DateTime DataHoraRetirada = DateTime.UtcNow;


    public static implicit operator RetiradaEstoqueModel(RetiradaEstoqueDTO dto)
    {
        return new RetiradaEstoqueModel()
        {
            Codigo = dto.Codigo,
            NomeOuDescricaoSimples = dto.NomeOuDescricaoSimples,
            Lote = dto.Lote,
            De = dto.De,
            Para = dto.Para,
            Quantidade = dto.Quantidade,
            DataHoraRetirada = dto.DataHoraRetirada
        };
    }

    public static implicit operator RetiradaEstoqueDTO(RetiradaEstoqueModel model)
    {
        return new RetiradaEstoqueDTO()
        {
            Codigo = model.Codigo,
            NomeOuDescricaoSimples = model.NomeOuDescricaoSimples,
            Lote = model.Lote,
            De = model.De,
            Para = model.Para,
            Quantidade = model.Quantidade,
            DataHoraRetirada = model.DataHoraRetirada
        };
    }
}
