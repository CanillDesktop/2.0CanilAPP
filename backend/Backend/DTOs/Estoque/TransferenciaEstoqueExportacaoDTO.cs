namespace Backend.DTOs.Estoque;

/// <summary>Linha de exportação: saída na origem e, se recebida, entrada no destino.</summary>
public sealed class TransferenciaMovimentoExportacaoDTO
{
    public int IdTransferencia { get; init; }
    public DateTime DataHora { get; init; }
    /// <summary>Saída ou Entrada.</summary>
    public string TipoMovimento { get; init; } = string.Empty;
    /// <summary>Unidade em que o movimento ocorreu.</summary>
    public string UnidadeMovimento { get; init; } = string.Empty;
    public int IdUnidadeOrigem { get; init; }
    public string UnidadeOrigemNome { get; init; } = string.Empty;
    public int IdUnidadeDestino { get; init; }
    public string UnidadeDestinoNome { get; init; } = string.Empty;
    /// <summary>Ex.: Secretaria → Canil.</summary>
    public string Direcao { get; init; } = string.Empty;
    public string Codigo { get; init; } = string.Empty;
    public string NomeItem { get; init; } = string.Empty;
    public string Lote { get; init; } = string.Empty;
    public int Quantidade { get; init; }
    public string Status { get; init; } = string.Empty;
    public string UsuarioEnvio { get; init; } = string.Empty;
    public string? UsuarioRecebimento { get; init; }
    public string? Observacao { get; init; }
}

public sealed class TransferenciaEstoqueExportacaoContextoDTO
{
    public DateTime GeradoEmUtc { get; init; } = DateTime.UtcNow;
    public int TotalMovimentos { get; init; }
    public int TotalTransferencias { get; init; }
    public int SomaQuantidadeSaidas { get; init; }
    public int SomaQuantidadeEntradas { get; init; }
    public bool IncluiSecParaCanil { get; init; }
    public bool IncluiCanilParaSec { get; init; }
}
