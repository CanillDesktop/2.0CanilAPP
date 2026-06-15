using Backend.DTOs.Estoque;
using Backend.Pagination;
using Backend.Repositories;

namespace Backend.Repositories.Interfaces;

public interface IEstoqueConsultaRepository
{

    Task<EstoqueConsultaPaginada> ConsultarPaginadoAsync(
        EstoqueFiltroDTO filtro,
        EstoqueConsultaParameters parameters,
        CancellationToken cancellationToken = default);
    Task<EstoqueContagemConsulta> ObterContagemPorOrigemAsync(
        CancellationToken cancellationToken = default);
}
