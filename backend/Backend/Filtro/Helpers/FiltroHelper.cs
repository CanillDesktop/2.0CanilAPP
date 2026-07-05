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
    /// <summary>
    /// Base para filtros e contagens: itens com presença na unidade (lote ou nível),
    /// sem Include — o total é por item, não por lote.
    /// </summary>
    public static IQueryable<T> Base<T>(IQueryable<T> query, int idUnidadeEstoque) where T : ItemComEstoqueBaseModel =>
        query.Where(p => !p.IsDeleted
            && (p.ItensEstoque.Any(e => e.IdUnidadeEstoque == idUnidadeEstoque && !e.IsDeleted)
                || p.ItensNivelEstoque.Any(n => n.IdUnidadeEstoque == idUnidadeEstoque && !n.IsDeleted)));

    /// <summary>Carrega lotes e níveis da unidade apenas na materialização da página.</summary>
    public static IQueryable<T> ComNavegacoesUnidade<T>(IQueryable<T> query, int idUnidadeEstoque)
        where T : ItemComEstoqueBaseModel =>
        query
            .Include(p => p.ItensEstoque
                .Where(e => e.IdUnidadeEstoque == idUnidadeEstoque && !e.IsDeleted)
                .OrderByDescending(e => e.DataHoraCriacao))
            .Include(p => p.ItensNivelEstoque.Where(n => n.IdUnidadeEstoque == idUnidadeEstoque && !n.IsDeleted));

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
        if (TermoBuscaQueryable.TryNormalizar(filtro.Termo, out var termo))
        {
            query = query.Where(p =>
                (p.Codigo != null && p.Codigo.ToLower().Contains(termo))
                || (p.DescricaoSimples != null && p.DescricaoSimples.ToLower().Contains(termo))
                || (p.DescricaoDetalhada != null && p.DescricaoDetalhada.ToLower().Contains(termo))
                || (p.ItensEstoque.Any(e =>
                    !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeEstoque && e.NFe != null && e.NFe.ToLower().Contains(termo)))
                || (p.ItensEstoque.Any(e =>
                    !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeEstoque && e.Lote != null && e.Lote.ToLower().Contains(termo))));
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

    /// <summary>
    /// Produtos com saldo &gt; 0 apenas em <paramref name="idUnidadeExclusiva"/>
    /// (sem saldo positivo na outra unidade).
    /// </summary>
    public static IQueryable<ProdutosModel> AplicarExclusivoUnidade(
        IQueryable<ProdutosModel> query,
        int idUnidadeExclusiva,
        int idUnidadeOutra)
    {
        return query.Where(p =>
            p.ItensEstoque.Where(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeExclusiva).Sum(e => e.Quantidade) > 0
            && p.ItensEstoque.Where(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeOutra).Sum(e => e.Quantidade) <= 0);
    }

    public static IQueryable<MedicamentosModel> AplicarFiltrosMedicamentos(
        IQueryable<MedicamentosModel> query,
        MedicamentosFiltro filtro,
        int idUnidadeEstoque)
    {
        if (TermoBuscaQueryable.TryNormalizar(filtro.Termo, out var termo))
        {
            query = query.Where(p =>
                (p.Codigo != null && p.Codigo.ToLower().Contains(termo))
                || (p.Descricao != null && p.Descricao.ToLower().Contains(termo))
                || (p.Formula != null && p.Formula.ToLower().Contains(termo))
                || (p.NomeComercial != null && p.NomeComercial.ToLower().Contains(termo))
                || (p.ItensEstoque.Any(e =>
                    !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeEstoque && e.NFe != null && e.NFe.ToLower().Contains(termo)))
                || (p.ItensEstoque.Any(e =>
                    !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeEstoque && e.Lote != null && e.Lote.ToLower().Contains(termo))));
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
        if (TermoBuscaQueryable.TryNormalizar(filtro.Termo, out var termo))
        {
            query = query.Where(p =>
                (p.Codigo != null && p.Codigo.ToLower().Contains(termo))
                || (p.DescricaoSimplificada != null && p.DescricaoSimplificada.ToLower().Contains(termo))
                || (p.DescricaoDetalhada != null && p.DescricaoDetalhada.ToLower().Contains(termo))
                || (p.ItensEstoque.Any(e =>
                    !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeEstoque && e.NFe != null && e.NFe.ToLower().Contains(termo)))
                || (p.ItensEstoque.Any(e =>
                    !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeEstoque && e.Lote != null && e.Lote.ToLower().Contains(termo))));
        }

        if (filtro.Unidade is int idUnidadeMedida && idUnidadeMedida > 0)
            query = query.Where(p => p.Unidade == idUnidadeMedida);

        if (filtro.DataEntrega.HasValue)
            query = query.Where(p =>
                p.ItensEstoque.Any(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeEstoque && e.DataEntrega == filtro.DataEntrega));

        if (filtro.DataValidade.HasValue)
            query = query.Where(p =>
                p.ItensEstoque.Any(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidadeEstoque && e.DataValidade == filtro.DataValidade));

        return query;
    }
}
