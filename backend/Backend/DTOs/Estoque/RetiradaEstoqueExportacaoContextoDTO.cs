namespace Backend.DTOs.Estoque;

/// <summary>Metadados do recorte exportado (cabeçalho e aba Resumo).</summary>
public sealed class RetiradaEstoqueExportacaoContextoDTO
{
    public DateTime DataInicioUtcAplicada { get; init; }

    public DateTime DataFimUtcInclusiveAplicada { get; init; }

    public int TotalRegistros { get; init; }

    public long SomaQuantidade { get; init; }

    public string? TermoBusca { get; init; }

    public string? FiltroRetirante { get; init; }

    public string? FiltroRecebedor { get; init; }
}
