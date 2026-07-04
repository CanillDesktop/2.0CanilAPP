using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Estoque;

public class TransferenciaEstoqueItemDTO
{
    public int IdItem { get; set; }
    public string Lote { get; set; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int Quantidade { get; set; }
}

public class TransferenciaEstoqueCriacaoDTO
{
    public int IdUnidadeDestino { get; set; }
    public string? Observacao { get; set; }
    public List<TransferenciaEstoqueItemDTO> Itens { get; set; } = [];
}

public class TransferenciaEstoqueLeituraDTO
{
    public int Id { get; set; }
    public int IdUnidadeOrigem { get; set; }
    public string UnidadeOrigemNome { get; set; } = string.Empty;
    public int IdUnidadeDestino { get; set; }
    public string UnidadeDestinoNome { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    /// <summary>
    /// Perspectiva na unidade ativa: <c>Saida</c> (origem) ou <c>Entrada</c> (destino).
    /// </summary>
    public string TipoMovimento { get; set; } = string.Empty;
    public DateTime DataTransferencia { get; set; }
    public string UsuarioEnvio { get; set; } = string.Empty;
    public string? UsuarioRecebimento { get; set; }
    public string? Observacao { get; set; }
    public List<TransferenciaEstoqueItemLeituraDTO> Itens { get; set; } = [];
}

public class TransferenciaEstoqueItemLeituraDTO
{
    public int IdItem { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string NomeItem { get; set; } = string.Empty;
    public string Lote { get; set; } = string.Empty;
    public int Quantidade { get; set; }
}
