using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.UnidadeMedida;

public class UnidadeMedidaDTO
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? Sigla { get; set; }
    public bool AplicavelProduto { get; set; }
    public bool AplicavelMedicamento { get; set; }
    public bool AplicavelInsumo { get; set; }
    public bool Ativa { get; set; }
}

public class UnidadeMedidaCadastroDTO
{
    [Required(ErrorMessage = "{0} é obrigatório")]
    [Display(Name = "Nome")]
    [MaxLength(80)]
    public string Nome { get; set; } = string.Empty;

    [Display(Name = "Sigla")]
    [MaxLength(20)]
    public string? Sigla { get; set; }

    public bool AplicavelProduto { get; set; }
    public bool AplicavelMedicamento { get; set; }
    public bool AplicavelInsumo { get; set; }
    public bool Ativa { get; set; } = true;
}

public class UnidadeMedidaAtualizacaoDTO : UnidadeMedidaCadastroDTO;
