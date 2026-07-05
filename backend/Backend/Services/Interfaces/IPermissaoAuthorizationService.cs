using Backend.DTOs.Permissoes;

namespace Backend.Services.Interfaces;

public interface IPermissaoAuthorizationService
{
    Task<bool> PossuiPermissaoAsync(
        string codigoPermissao,
        int? idUnidadeEstoque = null,
        int? idUsuario = null,
        CancellationToken cancellationToken = default);

    Task GarantirPermissaoAsync(
        string codigoPermissao,
        int? idUnidadeEstoque = null,
        CancellationToken cancellationToken = default);

    Task<bool> EhAdministradorAsync(int? idUsuario = null, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<string>> ObterCodigosGlobaisAsync(int idUsuario, CancellationToken cancellationToken = default);

    Task<UsuarioPermissoesResumoDTO> ObterResumoAsync(int idUsuario, CancellationToken cancellationToken = default);
}
