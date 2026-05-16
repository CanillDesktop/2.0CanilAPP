using Backend.Models.Produtos;

namespace Backend.Repositories;

public sealed record ProdutosResumoConsulta(
    int TotalNoRecorte,
    int Ativos,
    int BaixoEstoque,
    int SemEstoque,
    int AVencer);

/// <param name="Items">Página materializada com includes.</param>
/// <param name="TotalCount">Total de linhas após filtros (incl. status).</param>
public sealed record ProdutosConsultaPaginada(
    IReadOnlyList<ProdutosModel> Items,
    int TotalCount,
    ProdutosResumoConsulta Resumo);
