using System.Linq.Expressions;
using Backend.DTOs.Estoque;
using Backend.Models.Estoque;

namespace Backend.Repositories;

/// <summary>
/// Fonte única da regra de status operacional de estoque.
/// Usada tanto na consulta (filtro/ordenação via Expression traduzível para SQL)
/// quanto na projeção em memória (classificação por valores já agregados),
/// evitando duplicar a regra em vários lugares.
///
/// Prioridade: crítico (qtd ≤ 0) > próximo vencimento > baixo (qtd &lt; mínimo) > ok.
/// Pesos seguem a mesma escala do front (ok=0, baixo=1, proximo=2, critico=3).
/// </summary>
internal static class EstoqueStatusCalculo
{
    public const int PesoOk = 0;
    public const int PesoBaixo = 1;
    public const int PesoProximoVencimento = 2;
    public const int PesoCritico = 3;

    /// <summary>Limite (data) a partir de hoje para considerar um lote "próximo do vencimento".</summary>
    public static DateTime LimiteVencimento(DateTime hoje) =>
        hoje.AddDays(EstoqueStatusOperacional.DiasProximoVencimento);

    /// <summary>Classificação canônica em memória, a partir de valores já agregados.</summary>
    public static string Classificar(int quantidadeTotal, int minimo, bool temProximoVencimento)
    {
        if (quantidadeTotal <= 0) return EstoqueStatusOperacional.Critico;
        if (temProximoVencimento) return EstoqueStatusOperacional.ProximoVencimento;
        if (quantidadeTotal < minimo) return EstoqueStatusOperacional.Baixo;
        return EstoqueStatusOperacional.Ok;
    }

    /// <summary>Peso/código de um status (mapeia string ↔ código usado no filtro/ordenação).</summary>
    public static int Peso(string? status) => status?.Trim().ToLowerInvariant() switch
    {
        EstoqueStatusOperacional.Critico => PesoCritico,
        EstoqueStatusOperacional.ProximoVencimento => PesoProximoVencimento,
        EstoqueStatusOperacional.Baixo => PesoBaixo,
        _ => PesoOk,
    };

    /// <summary>
    /// Contraparte de <see cref="Classificar"/> traduzível para SQL: devolve o mesmo código/peso
    /// de status por item. Usada para filtrar (código == alvo) e ordenar por status.
    /// </summary>
    public static Expression<Func<T, int>> CodigoExpression<T>(DateTime hoje, DateTime limite)
        where T : ItemComEstoqueBaseModel =>
        x =>
            x.ItensEstoque.Where(e => !e.IsDeleted).Sum(e => e.Quantidade) <= 0
                ? PesoCritico
                : x.ItensEstoque.Any(e =>
                        !e.IsDeleted
                        && e.DataValidade != null
                        && e.DataValidade >= hoje
                        && e.DataValidade <= limite)
                    ? PesoProximoVencimento
                    : x.ItensEstoque.Where(e => !e.IsDeleted).Sum(e => e.Quantidade)
                        < (x.ItemNivelEstoque != null ? x.ItemNivelEstoque.NivelMinimoEstoque : 0)
                        ? PesoBaixo
                        : PesoOk;
}
