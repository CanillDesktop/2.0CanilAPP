using System.Linq.Expressions;
using Backend.DTOs.Estoque;
using Backend.Models.Estoque;
using Backend.Models.Insumos;
using Backend.Models.Medicamentos;
using Backend.Models.Produtos;
using Backend.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

internal static class EstoqueConsultaQueryable
{
    public static IQueryable<T> Base<T>(IQueryable<T> query, int idUnidadeEstoque)
        where T : ItemComEstoqueBaseModel =>
        query
            .Include(x => x.ItensEstoque.Where(e => e.IdUnidadeEstoque == idUnidadeEstoque && !e.IsDeleted))
            .Include(x => x.ItensNivelEstoque.Where(n => n.IdUnidadeEstoque == idUnidadeEstoque && !n.IsDeleted))
            .Where(x => !x.IsDeleted);

    public static IQueryable<T> AplicarFiltrosComuns<T>(
        IQueryable<T> query,
        EstoqueFiltroDTO filtro,
        int idUnidadeEstoque)
        where T : ItemComEstoqueBaseModel
    {
        if (filtro.QuantidadeMinima is int qMin)
            query = query.Where(x =>
                x.ItensEstoque.Where(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeEstoque).Sum(e => e.Quantidade) >= qMin);

        if (filtro.QuantidadeMaxima is int qMax)
            query = query.Where(x =>
                x.ItensEstoque.Where(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeEstoque).Sum(e => e.Quantidade) <= qMax);

        if (filtro.ValidadeDe.HasValue)
        {
            var de = filtro.ValidadeDe.Value.Date;
            query = query.Where(x =>
                x.ItensEstoque.Any(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeEstoque && e.DataValidade != null && e.DataValidade >= de));
        }

        if (filtro.ValidadeAte.HasValue)
        {
            var ate = filtro.ValidadeAte.Value.Date;
            query = query.Where(x =>
                x.ItensEstoque.Any(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeEstoque && e.DataValidade != null && e.DataValidade <= ate));
        }

        if (filtro.MovimentacaoDe.HasValue)
        {
            var de = filtro.MovimentacaoDe.Value.Date;
            query = query.Where(x =>
                x.ItensEstoque.Any(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeEstoque && e.DataEntrega >= de));
        }

        if (filtro.MovimentacaoAte.HasValue)
        {
            var ate = filtro.MovimentacaoAte.Value.Date;
            query = query.Where(x =>
                x.ItensEstoque.Any(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeEstoque && e.DataEntrega <= ate));
        }

        return query;
    }

    public static IQueryable<T> AplicarStatusOperacional<T>(
        IQueryable<T> query,
        string? status,
        int idUnidadeEstoque)
        where T : ItemComEstoqueBaseModel
    {
        if (string.IsNullOrWhiteSpace(status)) return query;

        var hoje = DateTime.UtcNow.Date;
        var limite = EstoqueStatusCalculo.LimiteVencimento(hoje);
        var alvo = EstoqueStatusCalculo.Peso(status);

        var codigo = EstoqueStatusCalculo.CodigoExpression<T>(hoje, limite, idUnidadeEstoque);
        var predicado = Expression.Lambda<Func<T, bool>>(
            Expression.Equal(codigo.Body, Expression.Constant(alvo)),
            codigo.Parameters);

        return query.Where(predicado);
    }

    public static IQueryable<ProdutosModel> AplicarTermoBuscaProdutos(
        IQueryable<ProdutosModel> query,
        EstoqueFiltroDTO filtro)
    {
        if (string.IsNullOrWhiteSpace(filtro.TermoBusca)) return query;

        var termo = filtro.TermoBusca.Trim();
        return query.Where(p =>
            (p.Codigo != null && p.Codigo.Contains(termo))
            || (p.DescricaoSimples != null && p.DescricaoSimples.Contains(termo)));
    }

    public static IQueryable<MedicamentosModel> AplicarTermoBuscaMedicamentos(
        IQueryable<MedicamentosModel> query,
        EstoqueFiltroDTO filtro)
    {
        if (string.IsNullOrWhiteSpace(filtro.TermoBusca)) return query;

        var termo = filtro.TermoBusca.Trim();
        return query.Where(m =>
            (m.Codigo != null && m.Codigo.Contains(termo))
            || (m.NomeComercial != null && m.NomeComercial.Contains(termo))
            || (m.Formula != null && m.Formula.Contains(termo))
            || (m.Descricao != null && m.Descricao.Contains(termo)));
    }

    public static IQueryable<InsumosModel> AplicarTermoBuscaInsumos(
        IQueryable<InsumosModel> query,
        EstoqueFiltroDTO filtro)
    {
        if (string.IsNullOrWhiteSpace(filtro.TermoBusca)) return query;

        var termo = filtro.TermoBusca.Trim();
        return query.Where(i =>
            (i.Codigo != null && i.Codigo.Contains(termo))
            || (i.DescricaoSimplificada != null && i.DescricaoSimplificada.Contains(termo)));
    }

    public static IQueryable<ProdutosModel> AplicarOrdenacaoProdutos(
        IQueryable<ProdutosModel> query,
        EstoqueConsultaParameters p,
        int idUnidadeEstoque) =>
        AplicarOrdenacao(query, p, x => x.DescricaoSimples, idUnidadeEstoque);

    public static IQueryable<MedicamentosModel> AplicarOrdenacaoMedicamentos(
        IQueryable<MedicamentosModel> query,
        EstoqueConsultaParameters p,
        int idUnidadeEstoque) =>
        AplicarOrdenacao(query, p, x => x.NomeComercial, idUnidadeEstoque);

    public static IQueryable<InsumosModel> AplicarOrdenacaoInsumos(
        IQueryable<InsumosModel> query,
        EstoqueConsultaParameters p,
        int idUnidadeEstoque) =>
        AplicarOrdenacao(query, p, x => x.DescricaoSimplificada, idUnidadeEstoque);

    private static IQueryable<T> AplicarOrdenacao<T>(
        IQueryable<T> query,
        EstoqueConsultaParameters p,
        Expression<Func<T, string>> seletorNome,
        int idUnidadeEstoque)
        where T : ItemComEstoqueBaseModel
    {
        var asc = p.IsSortAscending;
        var hoje = DateTime.UtcNow.Date;
        var limite = EstoqueStatusCalculo.LimiteVencimento(hoje);

        IOrderedQueryable<T> ordenado = p.NormalizedOrderBy switch
        {
            "quantidade" => asc
                ? query.OrderBy(x => x.ItensEstoque.Where(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeEstoque).Sum(e => e.Quantidade))
                : query.OrderByDescending(x => x.ItensEstoque.Where(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeEstoque).Sum(e => e.Quantidade)),

            "validade" => asc
                ? query.OrderBy(x => x.ItensEstoque.Where(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeEstoque && e.DataValidade != null)
                    .Min(e => (DateTime?)e.DataValidade))
                : query.OrderByDescending(x => x.ItensEstoque.Where(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeEstoque && e.DataValidade != null)
                    .Min(e => (DateTime?)e.DataValidade)),

            "ultimamovimentacao" => asc
                ? query.OrderBy(x => x.ItensEstoque.Where(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeEstoque)
                    .Max(e => (DateTime?)e.DataEntrega))
                : query.OrderByDescending(x => x.ItensEstoque.Where(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeEstoque)
                    .Max(e => (DateTime?)e.DataEntrega)),

            "status" => asc
                ? query.OrderBy(EstoqueStatusCalculo.CodigoExpression<T>(hoje, limite, idUnidadeEstoque))
                : query.OrderByDescending(EstoqueStatusCalculo.CodigoExpression<T>(hoje, limite, idUnidadeEstoque)),

            _ => asc
                ? query.OrderBy(seletorNome)
                : query.OrderByDescending(seletorNome),
        };

        return ordenado.ThenBy(x => x.Id);
    }
}
