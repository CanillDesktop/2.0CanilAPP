using Backend.Filtro.Produtos;
using Backend.Models.Enums;
using Backend.Models.Estoque;
using Backend.Models.Produtos;
using Microsoft.EntityFrameworkCore;

namespace Backend.Filtro.Helpers;

internal static class FiltroHelper
{
    public static IQueryable<T> Base<T>(IQueryable<T> query) where T : ItemComEstoqueBaseModel =>
        query
            .Include(p => p.ItensEstoque.Where(e => !e.IsDeleted))
            .Include(p => p.ItemNivelEstoque)
            .Where(p => !p.IsDeleted);


    public static IQueryable<T> AplicarStatusEstoque<T>(
        IQueryable<T> query,
        string? statusEstoque) where T : ItemComEstoqueBaseModel
    {
        if (string.IsNullOrWhiteSpace(statusEstoque)
            || statusEstoque.Equals("todos", StringComparison.OrdinalIgnoreCase))
        {
            return query;
        }

        var hoje = DateTime.UtcNow.Date;
        var limiteVencimento = hoje.AddDays(30);

        return statusEstoque.ToLowerInvariant() switch
        {
            "sem_estoque" => query.Where(p =>
                !p.ItensEstoque.Any(e => !e.IsDeleted)
                || p.ItensEstoque.Where(e => !e.IsDeleted).Sum(e => e.Quantidade) <= 0),
            "baixo" => query.Where(p =>
                p.ItensEstoque.Where(e => !e.IsDeleted).Sum(e => e.Quantidade) > 0
                && p.ItensEstoque.Where(e => !e.IsDeleted).Sum(e => e.Quantidade)
                    < (p.ItemNivelEstoque != null ? p.ItemNivelEstoque.NivelMinimoEstoque : 0)),
            "ativo" => query.Where(p =>
                p.ItensEstoque.Where(e => !e.IsDeleted).Sum(e => e.Quantidade) > 0
                && p.ItensEstoque.Where(e => !e.IsDeleted).Sum(e => e.Quantidade)
                    >= (p.ItemNivelEstoque != null ? p.ItemNivelEstoque.NivelMinimoEstoque : 0)),
            "a_vencer" => query.Where(p =>
                p.ItensEstoque.Any(e =>
                    !e.IsDeleted
                    && e.DataValidade != null
                    && e.DataValidade >= hoje
                    && e.DataValidade <= limiteVencimento)),
            _ => query,
        };
    }

    public static IQueryable<ProdutosModel> AplicarFiltrosProdutos(
        IQueryable<ProdutosModel> query,
        ProdutosFiltro filtro)
    {
        if (!string.IsNullOrWhiteSpace(filtro.Termo))
        {
            var termo = filtro.Termo.Trim();
            query = query.Where(p =>
                (p.Codigo != null && p.Codigo.Contains(termo))
                || (p.DescricaoSimples != null && p.DescricaoSimples.Contains(termo))
                || (p.DescricaoDetalhada != null && p.DescricaoDetalhada.Contains(termo))
                || (p.ItensEstoque.Any(e =>
                    !e.IsDeleted && e.NFe != null && e.NFe.Contains(termo)))
                || (p.ItensEstoque.Any(e =>
                    !e.IsDeleted && e.Lote != null && e.Lote.Contains(termo))));
        }

        if (filtro.Categoria.HasValue && Enum.IsDefined(typeof(CategoriaEnum), filtro.Categoria.Value))
            query = query.Where(p => p.Categoria == (CategoriaEnum)filtro.Categoria.Value);

        if (filtro.DataEntrega.HasValue)
            query = query.Where(p =>
                p.ItensEstoque.Any(e => !e.IsDeleted && e.DataEntrega == filtro.DataEntrega));

        if (filtro.DataValidade.HasValue)
            query = query.Where(p =>
                p.ItensEstoque.Any(e => !e.IsDeleted && e.DataValidade == filtro.DataValidade));

        return query;
    }
}
