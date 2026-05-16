using Backend.Context;
using Backend.DTOs.Estoque;
using Backend.Models.Estoque;
using Backend.Models.Usuarios;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

internal static class RetiradaEstoqueConsultaQueryable
{
    public static IQueryable<RetiradaEstoqueModel> FiltrarDataETermo(
        this IQueryable<RetiradaEstoqueModel> q,
        RetiradaEstoqueFiltroConsulta filt)
    {
        q = q.Where(r =>
            r.DataHoraRetirada >= filt.IntervaloIniUtcInclusive
            && r.DataHoraRetirada <= filt.IntervaloFimUtcInclusive);

        if (!string.IsNullOrWhiteSpace(filt.TermoBusca))
        {
            var t = filt.TermoBusca.Trim().ToLowerInvariant();
            var idParsavel = int.TryParse(t, out var idParsado);
            q = q.Where(r =>
                r.Codigo.ToLower().Contains(t)
                || r.NomeOuDescricaoSimples.ToLower().Contains(t)
                || r.Lote.ToLower().Contains(t)
                || r.De.ToLower().Contains(t)
                || r.Para.ToLower().Contains(t)
                || (r.Observacao != null && r.Observacao.ToLower().Contains(t))
                || (idParsavel && r.Id == idParsado));
        }

        return q;
    }

    public static async Task<long> SumQuantidadeAsync(
        this IQueryable<RetiradaEstoqueModel> intersecao,
        CancellationToken cancellationToken = default)
    {
        return await intersecao
            .Select(r => (long?)r.Quantidade)
            .SumAsync(cancellationToken) ?? 0L;
    }

    public static IQueryable<RetiradaEstoqueHistoricoItemDTO> ProjecaoHistoricoOrdenado(
        CanilAppDbContext ctx,
        IQueryable<RetiradaEstoqueModel> intersectFiltrado,
        bool ordemDataAscendente)
    {
        var ordenado = ordemDataAscendente
            ? intersectFiltrado.OrderBy(r => r.DataHoraRetirada)
            : intersectFiltrado.OrderByDescending(r => r.DataHoraRetirada);

        return ProjecaoHistorico(ctx, ordenado);
    }

    public static IQueryable<RetiradaEstoqueHistoricoItemDTO> ProjecaoPaginaHistorico(
        CanilAppDbContext ctx,
        IQueryable<RetiradaEstoqueModel> intersectFiltrado,
        int skip,
        int take,
        bool ordemDataAscendente)
    {
        var ordenado = ordemDataAscendente
            ? intersectFiltrado.OrderBy(r => r.DataHoraRetirada)
            : intersectFiltrado.OrderByDescending(r => r.DataHoraRetirada);
        var innerPage = ordenado.Skip(skip).Take(take);

        return ProjecaoHistorico(ctx, innerPage);
    }

    private static IQueryable<RetiradaEstoqueHistoricoItemDTO> ProjecaoHistorico(
        CanilAppDbContext ctx,
        IQueryable<RetiradaEstoqueModel> fonte)
    {
        return from r in fonte
               join ur in ctx.Usuarios.AsNoTracking() on r.IdUsuarioRetirante equals ur.Id into urGroup
               from ur in urGroup.DefaultIfEmpty()
               join rr in ctx.Usuarios.AsNoTracking() on r.IdUsuarioRecebedor equals rr.Id into rrGroup
               from rr in rrGroup.DefaultIfEmpty()
               select new RetiradaEstoqueHistoricoItemDTO
               {
                   Id = r.Id,
                   DataHoraRetirada = r.DataHoraRetirada,
                   Codigo = r.Codigo,
                   NomeProduto = r.NomeOuDescricaoSimples,
                   Lote = r.Lote,
                   Quantidade = r.Quantidade,
                   Observacao = r.Observacao,
                   Status = r.Status,
                   IdUsuarioRetirante = r.IdUsuarioRetirante,
                   IdUsuarioRecebedor = r.IdUsuarioRecebedor,
                   UsuarioRetiranteExibicao = MontarNome(ur, r.De),
                   UsuarioRecebedorExibicao = MontarNome(rr, r.Para),
               };
    }

    private static string MontarNome(UsuariosModel? u, string fallbackTexto)
    {
        if (u == null)
            return fallbackTexto;

        var nomeCompleto = $"{u.PrimeiroNome} {u.Sobrenome}".Trim();
        return string.IsNullOrWhiteSpace(nomeCompleto) ? fallbackTexto : nomeCompleto;
    }
}
