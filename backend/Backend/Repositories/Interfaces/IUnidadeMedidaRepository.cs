using Backend.Models.Enums;
using Backend.Models.UnidadeMedida;

namespace Backend.Repositories.Interfaces;

public interface IUnidadeMedidaRepository
{
    Task<IReadOnlyList<UnidadeMedidaModel>> ListarAsync(
        TipoItemUnidadeMedida? aplicavelA = null,
        bool apenasAtivas = true,
        CancellationToken cancellationToken = default);

    Task<UnidadeMedidaModel?> ObterPorIdAsync(int id, CancellationToken cancellationToken = default);

    Task<UnidadeMedidaModel?> ObterPorNomeAsync(string nome, CancellationToken cancellationToken = default);

    Task<UnidadeMedidaModel> CriarAsync(UnidadeMedidaModel model, CancellationToken cancellationToken = default);

    Task<UnidadeMedidaModel> AtualizarAsync(UnidadeMedidaModel model, CancellationToken cancellationToken = default);

    Task<bool> ExisteAplicavelAsync(
        int id,
        TipoItemUnidadeMedida tipo,
        CancellationToken cancellationToken = default);
}
