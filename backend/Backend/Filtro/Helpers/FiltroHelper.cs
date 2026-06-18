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
        if (TermoBuscaQueryable.TryNormalizar(filtro.Termo, out var termo))
        {
            query = query.Where(p =>
                (p.Codigo != null && p.Codigo.ToLower().Contains(termo))
                || (p.DescricaoSimples != null && p.DescricaoSimples.ToLower().Contains(termo))
                || (p.DescricaoDetalhada != null && p.DescricaoDetalhada.ToLower().Contains(termo))
                || (p.ItensEstoque.Any(e =>
                    !e.IsDeleted && e.NFe != null && e.NFe.ToLower().Contains(termo)))
                || (p.ItensEstoque.Any(e =>
                    !e.IsDeleted && e.Lote != null && e.Lote.ToLower().Contains(termo))));
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

    public static IQueryable<MedicamentosModel> AplicarFiltrosMedicamentos(
        IQueryable<MedicamentosModel> query,
        MedicamentosFiltro filtro)
    {
        if (TermoBuscaQueryable.TryNormalizar(filtro.Termo, out var termo))
        {
            query = query.Where(p =>
                (p.Codigo != null && p.Codigo.ToLower().Contains(termo))
                || (p.Descricao != null && p.Descricao.ToLower().Contains(termo))
                || (p.Formula != null && p.Formula.ToLower().Contains(termo))
                || (p.NomeComercial != null && p.NomeComercial.ToLower().Contains(termo))
                || (p.ItensEstoque.Any(e =>
                    !e.IsDeleted && e.NFe != null && e.NFe.ToLower().Contains(termo)))
                || (p.ItensEstoque.Any(e =>
                    !e.IsDeleted && e.Lote != null && e.Lote.ToLower().Contains(termo))));
        }

        if (filtro.Prioridade.HasValue && Enum.IsDefined(typeof(PrioridadeEnum), filtro.Prioridade.Value))
            query = query.Where(p => p.Prioridade == (PrioridadeEnum)filtro.Prioridade.Value);

        if (filtro.PublicoAlvo.HasValue && Enum.IsDefined(typeof(PublicoAlvoMedicamentoEnum), filtro.PublicoAlvo.Value))
            query = query.Where(p => p.PublicoAlvo == (PublicoAlvoMedicamentoEnum)filtro.PublicoAlvo.Value);

        if (filtro.DataEntrega.HasValue)
            query = query.Where(p =>
                p.ItensEstoque.Any(e => !e.IsDeleted && e.DataEntrega == filtro.DataEntrega));

        if (filtro.DataValidade.HasValue)
            query = query.Where(p =>
                p.ItensEstoque.Any(e => !e.IsDeleted && e.DataValidade == filtro.DataValidade));

        return query;
    }

    public static IQueryable<InsumosModel> AplicarFiltrosInsumos(
        IQueryable<InsumosModel> query,
        InsumosFiltro filtro)
    {
        if (TermoBuscaQueryable.TryNormalizar(filtro.Termo, out var termo))
        {
            query = query.Where(p =>
                (p.Codigo != null && p.Codigo.ToLower().Contains(termo))
                || (p.DescricaoSimplificada != null && p.DescricaoSimplificada.ToLower().Contains(termo))
                || (p.DescricaoDetalhada != null && p.DescricaoDetalhada.ToLower().Contains(termo))
                || (p.ItensEstoque.Any(e =>
                    !e.IsDeleted && e.NFe != null && e.NFe.ToLower().Contains(termo)))
                || (p.ItensEstoque.Any(e =>
                    !e.IsDeleted && e.Lote != null && e.Lote.ToLower().Contains(termo))));
        }

        if (filtro.Unidade.HasValue && Enum.IsDefined(typeof(UnidadeInsumosEnum), filtro.Unidade.Value))
            query = query.Where(p => p.Unidade == (UnidadeInsumosEnum)filtro.Unidade.Value);

        if (filtro.DataEntrega.HasValue)
            query = query.Where(p =>
                p.ItensEstoque.Any(e => !e.IsDeleted && e.DataEntrega == filtro.DataEntrega));

        if (filtro.DataValidade.HasValue)
            query = query.Where(p =>
                p.ItensEstoque.Any(e => !e.IsDeleted && e.DataValidade == filtro.DataValidade));

        return query;
    }
}
