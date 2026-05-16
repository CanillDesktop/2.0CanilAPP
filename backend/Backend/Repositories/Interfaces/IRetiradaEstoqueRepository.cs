using Backend.Models.Estoque;
using Backend.Pagination;
using Backend.Repositories;

namespace Backend.Repositories.Interfaces;

public interface IRetiradaEstoqueRepository
{
    Task<IEnumerable<RetiradaEstoqueModel>> GetAsync();

    Task<RetiradaEstoqueModel?> CreateAsync(RetiradaEstoqueModel obj, bool saveChanges = true);

    Task<RetiradaEstoqueHistoricoConsulta> ConsultarHistoricoAsync(
        RetiradaEstoqueFiltroConsulta filtros,
        RetiradaEstoqueParameters parameters,
        CancellationToken cancellationToken = default);
}
