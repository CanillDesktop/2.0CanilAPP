namespace Backend.DTOs.Estoque;

/// <summary>
/// Filtros de negócio da listagem de estoque (/estoque).
/// Espelha os filtros que hoje rodam client-side em useListaEstoqueProcessada.
/// </summary>
public class EstoqueFiltroDTO
{
    /// <summary>Obrigatório (Opção A): qual aba/consulta executar.</summary>
    public EstoqueOrigem Origem { get; set; }

    /// <summary>Busca no nome/descrição (e código quando existir na entidade).</summary>
    public string? TermoBusca { get; set; }

    /// <summary>vazio/null = todos. Valores: ok | baixo | proximo_vencimento | critico</summary>
    public string? StatusOperacional { get; set; }

    public int? QuantidadeMinima { get; set; }

    public int? QuantidadeMaxima { get; set; }

    /// <summary>Filtra pela menor data de validade entre os lotes ativos do item.</summary>
    public DateTime? ValidadeDe { get; set; }

    public DateTime? ValidadeAte { get; set; }

    /// <summary>Filtra pela maior data de entrega (última movimentação) entre os lotes ativos.</summary>
    public DateTime? MovimentacaoDe { get; set; }

    public DateTime? MovimentacaoAte { get; set; }
}
