using Backend.Filtro.Insumos;
using Backend.Filtro.Medicamentos;
using Backend.Filtro.Produtos;
using Backend.Models.Enums;
using Backend.Models.Estoque;
using Backend.Models.Insumos;
using Backend.Models.Medicamentos;
using Backend.Models.Produtos;
using Microsoft.EntityFrameworkCore;

namespace Backend.Filtro.Helpers;

internal static class FiltroHelper
{
    public static IQueryable<T> Base<T>(IQueryable<T> query, int idUnidadeEstoque) where T : ItemComEstoqueBaseModel =>
        query
            .Include(p => p.ItensEstoque.Where(e => e.IdUnidadeEstoque == idUnidadeEstoque && !e.IsDeleted))
            .Include(p => p.ItensNivelEstoque.Where(n => n.IdUnidadeEstoque == idUnidadeEstoque && !n.IsDeleted))
            .Where(p => !p.IsDeleted);

    public static IQueryable<T> AplicarStatusEstoque<T>(
        IQueryable<T> query,
        string? statusEstoque,
        int idUnidadeEstoque) where T : ItemComEstoqueBaseModel
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
                !p.ItensEstoque.Any(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeEstoque)
                || p.ItensEstoque.Where(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeEstoque).Sum(e => e.Quantidade) <= 0),
            "baixo" => query.Where(p =>
                p.ItensEstoque.Where(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeEstoque).Sum(e => e.Quantidade) > 0
                && p.ItensEstoque.Where(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeEstoque).Sum(e => e.Quantidade)
                    < (p.ItensNivelEstoque.Where(n => !n.IsDeleted && n.IdUnidadeEstoque == idUnidadeEstoque)
                        .Select(n => (int?)n.NivelMinimoEstoque).FirstOrDefault() ?? 0)),
            "ativo" => query.Where(p =>
                p.ItensEstoque.Where(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeEstoque).Sum(e => e.Quantidade) > 0
                && p.ItensEstoque.Where(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeEstoque).Sum(e => e.Quantidade)
                    >= (p.ItensNivelEstoque.Where(n => !n.IsDeleted && n.IdUnidadeEstoque == idUnidadeEstoque)
                        .Select(n => (int?)n.NivelMinimoEstoque).FirstOrDefault() ?? 0)),
            "a_vencer" => query.Where(p =>
                p.ItensEstoque.Any(e =>
                    !e.IsDeleted
                    && e.IdUnidadeEstoque == idUnidadeEstoque
                    && e.DataValidade != null
                    && e.DataValidade >= hoje
                    && e.DataValidade <= limiteVencimento)),
            _ => query,
        };
    }

    public static IQueryable<ProdutosModel> AplicarFiltrosProdutos(
        IQueryable<ProdutosModel> query,
        ProdutosFiltro filtro,
        int idUnidadeEstoque)
    {
        if (!string.IsNullOrWhiteSpace(filtro.Termo))
        {
            var termo = filtro.Termo.Trim();
            query = query.Where(p =>
                (p.Codigo != null && p.Codigo.Contains(termo))
                || (p.DescricaoSimples != null && p.DescricaoSimples.Contains(termo))
                || (p.DescricaoDetalhada != null && p.DescricaoDetalhada.Contains(termo))
                || (p.ItensEstoque.Any(e =>
                    !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeEstoque && e.NFe != null && e.NFe.Contains(termo)))
                || (p.ItensEstoque.Any(e =>
                    !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeEstoque && e.Lote != null && e.Lote.Contains(termo))));
        }

        if (filtro.Categoria.HasValue && Enum.IsDefined(typeof(CategoriaEnum), filtro.Categoria.Value))
            query = query.Where(p => p.Categoria == (CategoriaEnum)filtro.Categoria.Value);

        if (filtro.DataEntrega.HasValue)
            query = query.Where(p =>
                p.ItensEstoque.Any(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeEstoque && e.DataEntrega == filtro.DataEntrega));

        if (filtro.DataValidade.HasValue)
            query = query.Where(p =>
                p.ItensEstoque.Any(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeEstoque && e.DataValidade == filtro.DataValidade));

        return query;
    }

    public static IQueryable<MedicamentosModel> AplicarFiltrosMedicamentos(
        IQueryable<MedicamentosModel> query,
        MedicamentosFiltro filtro,
        int idUnidadeEstoque)
    {
        if (!string.IsNullOrWhiteSpace(filtro.Termo))
        {
            var termo = filtro.Termo.Trim();
            query = query.Where(p =>
                (p.Codigo != null && p.Codigo.Contains(termo))
                || (p.Descricao != null && p.Descricao.Contains(termo))
                || (p.Formula != null && p.Formula.Contains(termo))
                || (p.NomeComercial != null && p.NomeComercial.Contains(termo))
                || (p.ItensEstoque.Any(e =>
                    !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeEstoque && e.NFe != null && e.NFe.Contains(termo)))
                || (p.ItensEstoque.Any(e =>
                    !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeEstoque && e.Lote != null && e.Lote.Contains(termo))));
        }

        if (filtro.Prioridade.HasValue && Enum.IsDefined(typeof(PrioridadeEnum), filtro.Prioridade.Value))
            query = query.Where(p => p.Prioridade == (PrioridadeEnum)filtro.Prioridade.Value);

        if (filtro.PublicoAlvo.HasValue && Enum.IsDefined(typeof(PublicoAlvoMedicamentoEnum), filtro.PublicoAlvo.Value))
            query = query.Where(p => p.PublicoAlvo == (PublicoAlvoMedicamentoEnum)filtro.PublicoAlvo.Value);

        if (filtro.DataEntrega.HasValue)
            query = query.Where(p =>
                p.ItensEstoque.Any(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeEstoque && e.DataEntrega == filtro.DataEntrega));

        if (filtro.DataValidade.HasValue)
            query = query.Where(p =>
                p.ItensEstoque.Any(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeEstoque && e.DataValidade == filtro.DataValidade));

        return query;
    }

    public static IQueryable<InsumosModel> AplicarFiltrosInsumos(
        IQueryable<InsumosModel> query,
        InsumosFiltro filtro,
        int idUnidadeEstoque)
    {
        if (!string.IsNullOrWhiteSpace(filtro.Termo))
        {
            var termo = filtro.Termo.Trim();
            query = query.Where(p =>
                (p.Codigo != null && p.Codigo.Contains(termo))
                || (p.DescricaoSimplificada != null && p.DescricaoSimplificada.Contains(termo))
                || (p.DescricaoDetalhada != null && p.DescricaoDetalhada.Contains(termo))
                || (p.ItensEstoque.Any(e =>
                    !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeEstoque && e.NFe != null && e.NFe.Contains(termo)))
                || (p.ItensEstoque.Any(e =>
                    !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeEstoque && e.Lote != null && e.Lote.Contains(termo))));
        }

        if (filtro.Unidade.HasValue && Enum.IsDefined(typeof(UnidadeInsumosEnum), filtro.Unidade.Value))
            query = query.Where(p => p.Unidade == (UnidadeInsumosEnum)filtro.Unidade.Value);

        if (filtro.DataEntrega.HasValue)
            query = query.Where(p =>
                p.ItensEstoque.Any(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeEstoque && e.DataEntrega == filtro.DataEntrega));

        if (filtro.DataValidade.HasValue)
            query = query.Where(p =>
                p.ItensEstoque.Any(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeEstoque && e.DataValidade == filtro.DataValidade));

        return query;
    }
}
