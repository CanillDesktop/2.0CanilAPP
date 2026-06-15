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
        RetiradaEstoquePaginationParameters parameters,
        CancellationToken cancellationToken = default);

    Task<RetiradaEstoqueHistoricoExportacaoConsulta> ListarHistoricoParaExportacaoAsync(
        RetiradaEstoqueFiltroConsulta filtros,
        bool ordemDataAscendente,
        int limiteLinhas,
        CancellationToken cancellationToken = default);
}
