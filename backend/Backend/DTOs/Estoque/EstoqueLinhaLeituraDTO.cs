namespace Backend.DTOs.Estoque;

/// <summary>
/// Uma linha da gestão de estoque (/estoque).
/// Projeção agregada por item (produto/medicamento/insumo), não por lote.
/// </summary>
public class EstoqueLinhaLeituraDTO
{
    public int Id { get; set; }

    public string Nome { get; set; } = string.Empty;

    public int Quantidade { get; set; }

    public int Minimo { get; set; }

    /// <summary>Ex.: "15/08/2026" ou "Sem validade" (formatado no Service).</summary>
    public string Validade { get; set; } = string.Empty;

    public EstoqueOrigem Origem { get; set; }

    /// <summary>ok | baixo | proximo_vencimento | critico</summary>
    public string StatusOperacional { get; set; } = EstoqueStatusOperacional.Ok;

    /// <summary>Ex.: "03/06/2026" ou "Sem movimentacao".</summary>
    public string UltimaMovimentacao { get; set; } = string.Empty;

    /// <summary>Menor validade entre lotes (UTC). Usado para ordenação/filtro no servidor.</summary>
    public DateTime? MenorValidadeUtc { get; set; }

    /// <summary>Maior data de entrega entre lotes (UTC).</summary>
    public DateTime? UltimaMovimentacaoUtc { get; set; }
}
