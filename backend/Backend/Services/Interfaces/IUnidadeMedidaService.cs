using Backend.DTOs.UnidadeMedida;
using Backend.Models.Enums;

namespace Backend.Services.Interfaces;

public interface IUnidadeMedidaService
{
    Task<IReadOnlyList<UnidadeMedidaDTO>> ListarAsync(
        TipoItemUnidadeMedida? aplicavelA = null,
        bool apenasAtivas = true,
        CancellationToken cancellationToken = default);

    Task<UnidadeMedidaDTO?> ObterPorIdAsync(int id, CancellationToken cancellationToken = default);

    Task<UnidadeMedidaDTO> CriarAsync(UnidadeMedidaCadastroDTO dto, CancellationToken cancellationToken = default);

    Task<UnidadeMedidaDTO> AtualizarAsync(int id, UnidadeMedidaAtualizacaoDTO dto, CancellationToken cancellationToken = default);

    Task GarantirAplicavelAsync(int idUnidadeMedida, TipoItemUnidadeMedida tipo, CancellationToken cancellationToken = default);

    Task<string> ObterRotuloAsync(int idUnidadeMedida, CancellationToken cancellationToken = default);
}
