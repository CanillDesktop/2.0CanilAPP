using Backend.DTOs.Estoque;

namespace Backend.Repositories;

public sealed record RetiradaEstoqueHistoricoExportacaoConsulta(
    IReadOnlyList<RetiradaEstoqueHistoricoItemDTO> Linhas,
    int TotalRegistrosIntersecao,
    long SomaQuantidadeIntersecao);
