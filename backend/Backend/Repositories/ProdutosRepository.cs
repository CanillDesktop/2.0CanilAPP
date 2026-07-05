using Backend.Context;
using Backend.Exceptions;
using Backend.Filtro.Helpers;
using Backend.Filtro.Produtos;
using Backend.Models.Estoque;
using Backend.Models.Produtos;
using Backend.Pagination;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

public class ProdutosRepository : BaseCRUDEstoqueRepository<ProdutosModel>, IProdutosRepository
{
    public ProdutosRepository(CanilAppDbContext context, IUnidadeEstoqueContextService unidadeContext)
        : base(context, unidadeContext) { }

    public async Task<ConsultaPaginada<ProdutosModel>> ConsultarPaginadoAsync(
        ProdutosFiltro filtro,
        EstoqueConsultaParameters paginationParameters,
        int diasDataLimiteVencimento,
        CancellationToken cancellationToken = default)
    {
        var (idUnidade, idUnidadeOutraExclusiva) = await ResolverUnidadeConsultaAsync(filtro, cancellationToken);
        await _unidadeContext.GarantirConsultaAsync(idUnidade, cancellationToken);

        var pageNumber = Math.Max(paginationParameters.PageNumber, 1);
        var pageSize = Math.Max(paginationParameters.PageSize, 1);

        var baseQuery = FiltroHelper.Base(_context.Produtos.AsQueryable(), idUnidade);
        if (idUnidadeOutraExclusiva is int idOutra)
            baseQuery = FiltroHelper.AplicarExclusivoUnidade(baseQuery, idUnidade, idOutra);

        var filtrada = FiltroHelper.AplicarFiltrosProdutos(baseQuery, filtro, idUnidade);

        var hoje = DateTime.UtcNow.Date;
        var limiteVencimento = hoje.AddDays(diasDataLimiteVencimento);

        var resumo = new ItemComEstoqueResumoConsulta(
            TotalNoRecorte: await filtrada.CountAsync(cancellationToken),
            Ativos: await filtrada.CountAsync(
                p => p.ItensEstoque.Where(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidade).Sum(e => e.Quantidade) > 0
                     && p.ItensEstoque.Where(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidade).Sum(e => e.Quantidade)
                        >= (p.ItensNivelEstoque.Where(n => !n.IsDeleted && n.IdUnidadeEstoque == idUnidade)
                            .Select(n => (int?)n.NivelMinimoEstoque).FirstOrDefault() ?? 0),
                cancellationToken),
            BaixoEstoque: await filtrada.CountAsync(
                p => p.ItensEstoque.Where(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidade).Sum(e => e.Quantidade) > 0
                     && p.ItensEstoque.Where(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidade).Sum(e => e.Quantidade)
                        < (p.ItensNivelEstoque.Where(n => !n.IsDeleted && n.IdUnidadeEstoque == idUnidade)
                            .Select(n => (int?)n.NivelMinimoEstoque).FirstOrDefault() ?? 0),
                cancellationToken),
            SemEstoque: await filtrada.CountAsync(
                p => !p.ItensEstoque.Any(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidade)
                     || p.ItensEstoque.Where(e => !e.IsDeleted && e.IdUnidadeEstoque == idUnidade).Sum(e => e.Quantidade) <= 0,
                cancellationToken),
            AVencer: await filtrada.CountAsync(
                p => p.ItensEstoque.Any(e =>
                    !e.IsDeleted
                    && e.IdUnidadeEstoque == idUnidade
                    && e.DataValidade != null
                    && e.DataValidade >= hoje
                    && e.DataValidade <= limiteVencimento),
                cancellationToken));

        var comStatus = FiltroHelper.AplicarStatusEstoque(filtrada, filtro.StatusEstoque, idUnidade);
        var totalCount = await comStatus.CountAsync(cancellationToken);

        var ordenada = EstoqueConsultaQueryable.AplicarOrdenacaoProdutos(comStatus, paginationParameters, idUnidade);

        var items = await FiltroHelper.ComNavegacoesUnidade(ordenada, idUnidade)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new ConsultaPaginada<ProdutosModel>(items, totalCount, resumo);
    }

    /// <summary>
    /// Resolve a unidade de estoque da consulta e, se exclusividade for solicitada,
    /// a outra unidade (para filtrar produtos sem saldo nela).
    /// </summary>
    private async Task<(int IdUnidade, int? IdUnidadeOutraExclusiva)> ResolverUnidadeConsultaAsync(
        ProdutosFiltro filtro,
        CancellationToken cancellationToken)
    {
        var exclusivo = filtro.ExclusivoUnidade?.Trim().ToLowerInvariant();
        if (string.IsNullOrEmpty(exclusivo))
        {
            var ativa = await _unidadeContext.ObterUnidadeAtivaIdAsync(cancellationToken);
            return (ativa, null);
        }

        int idExclusiva;
        int idOutra;
        if (exclusivo is "secretaria" or "sec")
        {
            idExclusiva = UnidadeEstoqueIds.Secretaria;
            idOutra = UnidadeEstoqueIds.Canil;
        }
        else if (exclusivo is "canil" or "can")
        {
            idExclusiva = UnidadeEstoqueIds.Canil;
            idOutra = UnidadeEstoqueIds.Secretaria;
        }
        else
        {
            throw new RegraDeNegocioInfringidaException(
                "Filtro de exclusividade inválido. Use 'secretaria' ou 'canil'.");
        }

        var permitidas = await _unidadeContext.ObterUnidadesPermitidasAsync(cancellationToken);
        if (!permitidas.Contains(UnidadeEstoqueIds.Secretaria) || !permitidas.Contains(UnidadeEstoqueIds.Canil))
        {
            throw new AcessoNegadoException(
                "Consulta de produtos exclusivos por unidade exige permissão nas duas unidades.");
        }

        return (idExclusiva, idOutra);
    }
}
