using Backend.DTOs.Produtos;
using Backend.Models.Enums;
using Backend.Models.Produtos;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

internal static class ProdutosConsultaQueryable
{
    public static IQueryable<ProdutosModel> Base(IQueryable<ProdutosModel> query) =>
        query
            .Include(p => p.ItensEstoque.Where(e => !e.IsDeleted))
            .Include(p => p.ItemNivelEstoque)
            .Where(p => !p.IsDeleted);

    public static IQueryable<ProdutosModel> AplicarFiltros(
        IQueryable<ProdutosModel> query,
        ProdutosFiltroDTO filtro)
    {
        if (!string.IsNullOrWhiteSpace(filtro.TermoBusca))
        {
            var termo = filtro.TermoBusca.Trim();
            query = query.Where(p =>
                (p.Codigo != null && p.Codigo.Contains(termo))
                || (p.DescricaoSimples != null && p.DescricaoSimples.Contains(termo)));
        }

        if (!string.IsNullOrWhiteSpace(filtro.CodProduto))
            query = query.Where(p => p.Codigo != null && p.Codigo.Contains(filtro.CodProduto));

        if (!string.IsNullOrWhiteSpace(filtro.DescricaoSimples))
            query = query.Where(p => p.DescricaoSimples != null && p.DescricaoSimples.Contains(filtro.DescricaoSimples));

        if (!string.IsNullOrWhiteSpace(filtro.NFe))
            query = query.Where(p =>
                p.ItensEstoque.Any(e =>
                    !e.IsDeleted && e.NFe != null && e.NFe.Contains(filtro.NFe)));

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

    public static IQueryable<ProdutosModel> AplicarStatusEstoque(
        IQueryable<ProdutosModel> query,
        string? statusEstoque)
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
}
