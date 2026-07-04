using Backend.DTOs.Estoque;

namespace Backend.Services.Interfaces;

public interface IUnidadeEstoqueContextService
{
    Task<ContextoUnidadeEstoqueDTO> ObterContextoAsync(CancellationToken cancellationToken = default);
    Task<int> ObterUnidadeAtivaIdAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<int>> ObterUnidadesPermitidasAsync(CancellationToken cancellationToken = default);
    Task GarantirConsultaAsync(int idUnidadeEstoque, CancellationToken cancellationToken = default);
    Task GarantirEntradaAsync(int idUnidadeEstoque, CancellationToken cancellationToken = default);
    Task GarantirSaidaAsync(int idUnidadeEstoque, CancellationToken cancellationToken = default);
    Task GarantirTransferenciaEnviarAsync(int idUnidadeOrigem, CancellationToken cancellationToken = default);
    Task GarantirTransferenciaReceberAsync(int idUnidadeDestino, CancellationToken cancellationToken = default);
    bool EhAdministrador();
}
