using Backend.DTOs.Estoque;

namespace Backend.Repositories;

/// <summary>Resultado cru do repositório antes de aplicar TotalPages/metadata no service.</summary>
public sealed record RetiradaEstoqueHistoricoConsulta(
    IReadOnlyList<RetiradaEstoqueHistoricoItemDTO> Linhas,
    int TotalRegistrosIntersecao,
    long SomaQuantidadeIntersecao,
    int? TotalComoSomenteRetirante,
    int? TotalComoSomenteRecebedor);
