using Backend.Context;
using Backend.DTOs.Estoque;
using Backend.Models.Estoque;
using Backend.Pagination;
using Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

public class RetiradaEstoqueRepository : IRetiradaEstoqueRepository
{
    private readonly CanilAppDbContext _context;

    public RetiradaEstoqueRepository(CanilAppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<RetiradaEstoqueModel>> GetAsync() =>
        await _context.RetiradaEstoque.AsNoTracking().ToListAsync();

    public async Task<RetiradaEstoqueModel?> CreateAsync(RetiradaEstoqueModel model, bool saveChanges = true)
    {
        await _context.RetiradaEstoque.AddAsync(model);

        if (saveChanges)
            await _context.SaveChangesAsync();

        return model;
    }

    public async Task<RetiradaEstoqueHistoricoConsulta> ConsultarHistoricoAsync(
        RetiradaEstoqueFiltroConsulta filtros,
        RetiradaEstoquePaginationParameters parameters,
        CancellationToken cancellationToken = default)
    {
        var intersecao = MontarIntersecao(filtros);
        var totalIntersec = await intersecao.CountAsync(cancellationToken);
        var sumQtd = await intersecao.SumQuantidadeAsync(cancellationToken);

        var skip = (Math.Max(parameters.PageNumber, 1) - 1) * parameters.PageSize;
        var take = parameters.PageSize;

        var linhasProj = RetiradaEstoqueConsultaQueryable.ProjecaoPaginaHistorico(
            _context,
            intersecao,
            skip,
            take,
            parameters.OrdemDataAscendente);

        var linhas = await linhasProj.ToListAsync(cancellationToken);

        int? totalComoRetirante = null;
        int? totalComoRecebedor = null;

        if (filtros.IdUsuarioRetiranteLista is > 0)
        {
            totalComoRetirante = await intersecao.CountAsync(
                r => r.IdUsuarioRetirante == filtros.IdUsuarioRetiranteLista,
                cancellationToken);
        }

        if (filtros.IdUsuarioRecebedorLista is > 0)
        {
            totalComoRecebedor = await intersecao.CountAsync(
                r => r.IdUsuarioRecebedor == filtros.IdUsuarioRecebedorLista,
                cancellationToken);
        }

        return new RetiradaEstoqueHistoricoConsulta(
            linhas,
            totalIntersec,
            sumQtd,
            totalComoRetirante,
            totalComoRecebedor);
    }

    public async Task<RetiradaEstoqueHistoricoExportacaoConsulta> ListarHistoricoParaExportacaoAsync(
        RetiradaEstoqueFiltroConsulta filtros,
        bool ordemDataAscendente,
        int limiteLinhas,
        CancellationToken cancellationToken = default)
    {
        var intersecao = MontarIntersecao(filtros);
        var totalIntersec = await intersecao.CountAsync(cancellationToken);
        var sumQtd = await intersecao.SumQuantidadeAsync(cancellationToken);

        var linhasProj = RetiradaEstoqueConsultaQueryable.ProjecaoHistoricoOrdenado(
            _context,
            intersecao,
            ordemDataAscendente);

        var linhas = await linhasProj.Take(limiteLinhas + 1).ToListAsync(cancellationToken);

        return new RetiradaEstoqueHistoricoExportacaoConsulta(linhas, totalIntersec, sumQtd);
    }

    private IQueryable<RetiradaEstoqueModel> MontarIntersecao(RetiradaEstoqueFiltroConsulta filtros)
    {
        var baseQ = _context.RetiradaEstoque.AsNoTracking().FiltrarDataETermo(filtros);

        if (filtros.IdUsuarioRetiranteLista is > 0)
            baseQ = baseQ.Where(r => r.IdUsuarioRetirante == filtros.IdUsuarioRetiranteLista);

        if (filtros.IdUsuarioRecebedorLista is > 0)
            baseQ = baseQ.Where(r => r.IdUsuarioRecebedor == filtros.IdUsuarioRecebedorLista);

        return baseQ;
    }
}
