using Backend.Models.Estoque;

namespace Backend.Pagination;

public sealed record ItemComEstoqueResumoConsulta(
    int TotalNoRecorte,
    int Ativos,
    int BaixoEstoque,
    int SemEstoque,
    int AVencer);

/// <param name="Items">Página materializada com includes.</param>
/// <param name="TotalCount">Total de linhas após filtros (incl. status).</param>
public sealed record ConsultaPaginada<T>(
    IReadOnlyList<T> Items,
    int TotalCount,
    ItemComEstoqueResumoConsulta Resumo) where T : ItemComEstoqueBaseModel;
