namespace Backend.DTOs.Estoque;

/// <summary>
/// Totais com a mesma janela de datas e mesmo termo de busca aplicados aos filtros correspondentes da API.
/// </summary>
public class RetiradaEstoqueMetricasFiltragemDTO
{
    /// <summary>Total de registros sob o filtro “intersecção” (lista + paginação).</summary>
    public int TotalRegistrosNoRecorte { get; set; }

    /// <summary>Soma das quantidades no recorte intersectado.</summary>
    public long SomaQuantidadeItens { get; set; }

    /// <summary>
    /// Contagem no período+termo, apenas para usuário informado como retirante, ignorando o filtro por recebedor.
    /// Ausente quando <c>IdUsuarioRetirante</c> não foi enviado.
    /// </summary>
    public int? TotalRetiradasFeitasPorUsuarioRetiranteFiltro { get; set; }

    /// <summary>
    /// Contagem no período+termo, apenas para usuário informado como recebedor, ignorando o filtro por retirante.
    /// Ausente quando <c>IdUsuarioRecebedor</c> não foi enviado.
    /// </summary>
    public int? TotalRetiradasRecebidasPorUsuarioRecebedorFiltro { get; set; }
}
