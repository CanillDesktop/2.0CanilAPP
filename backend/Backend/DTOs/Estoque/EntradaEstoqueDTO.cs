using System.ComponentModel.DataAnnotations;
using Backend.Models.Enums;

namespace Backend.DTOs.Estoque;

public class EntradaEstoqueDTO
{
    [Required]
    public int IdItem { get; set; }

    [Required]
    public TipoEntradaEstoqueEnum TipoEntrada { get; set; }

    [Range(1, int.MaxValue)]
    public int Quantidade { get; set; }

    [Required]
    public DateTime DataEntrega { get; set; }

    public DateTime? DataValidade { get; set; }

    public string? NFe { get; set; }
    public string? FornecedorNome { get; set; }
    public string? FornecedorDocumento { get; set; }
    public string? DoadorNome { get; set; }
    public string? DoadorDocumento { get; set; }
    public string? Observacao { get; set; }

    public int? NivelMinimoEstoque { get; set; }
}

public enum TipoEntradaEstoqueEnum
{
    Compra = 1,
    Doacao,
}
