namespace Backend.Pagination;

/// <summary>
/// Paginação + ordenação server-side da listagem de estoque (/estoque).
/// Herda PageNumber/PageSize (teto 50) de PaginationParameters.
/// </summary>
public class EstoqueConsultaParameters : PaginationParameters
{
    /// <summary>nome | quantidade | validade | status | ultimaMovimentacao</summary>
    public string OrderBy { get; set; } = "nome";

    /// <summary>asc | desc</summary>
    public string SortDirection { get; set; } = "asc";

    public bool IsSortAscending =>
        string.Equals(SortDirection, "asc", StringComparison.OrdinalIgnoreCase);

    public string NormalizedOrderBy => string.IsNullOrWhiteSpace(OrderBy)
        ? "nome"
        : OrderBy.Trim().ToLowerInvariant();
}
