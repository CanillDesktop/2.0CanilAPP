using System.Linq.Expressions;
using Backend.DTOs.Estoque;
using Backend.Models.Estoque;

namespace Backend.Repositories;

internal static class EstoqueStatusCalculo
{
    public const int PesoOk = 0;
    public const int PesoBaixo = 1;
    public const int PesoProximoVencimento = 2;
    public const int PesoCritico = 3;

    public static DateTime LimiteVencimento(DateTime hoje) =>
        hoje.AddDays(EstoqueStatusOperacional.DiasProximoVencimento);

    public static string Classificar(int quantidadeTotal, int minimo, bool temProximoVencimento)
    {
        if (quantidadeTotal <= 0) return EstoqueStatusOperacional.Critico;
        if (temProximoVencimento) return EstoqueStatusOperacional.ProximoVencimento;
        if (quantidadeTotal < minimo) return EstoqueStatusOperacional.Baixo;
        return EstoqueStatusOperacional.Ok;
    }

    public static int Peso(string? status) => status?.Trim().ToLowerInvariant() switch
    {
        EstoqueStatusOperacional.Critico => PesoCritico,
        EstoqueStatusOperacional.ProximoVencimento => PesoProximoVencimento,
        EstoqueStatusOperacional.Baixo => PesoBaixo,
        _ => PesoOk,
    };

    public static Expression<Func<T, int>> CodigoExpression<T>(DateTime hoje, DateTime limite, int idUnidadeEstoque)
        where T : ItemComEstoqueBaseModel =>
        x =>
            x.ItensEstoque.Where(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeEstoque).Sum(e => e.Quantidade) <= 0
                ? PesoCritico
                : x.ItensEstoque.Any(e =>
                        !e.IsDeleted
                        && e.IdUnidadeEstoque == idUnidadeEstoque
                        && e.DataValidade != null
                        && e.DataValidade >= hoje
                        && e.DataValidade <= limite)
                    ? PesoProximoVencimento
                    : x.ItensEstoque.Where(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeEstoque).Sum(e => e.Quantidade)
                        < (x.ItensNivelEstoque
                            .Where(n => !n.IsDeleted && n.IdUnidadeEstoque == idUnidadeEstoque)
                            .Select(n => (int?)n.NivelMinimoEstoque)
                            .FirstOrDefault() ?? 0)
                        ? PesoBaixo
                        : PesoOk;
}
