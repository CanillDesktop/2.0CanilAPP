using Backend.DTOs.Estoque;
using Backend.Models.Estoque;

namespace Backend.Services.Interfaces;

public interface IEntradaEstoqueService
{
    Task<ItemEstoqueModel> RegistrarEntradaAsync(EntradaEstoqueDTO dto, CancellationToken cancellationToken = default);
}

public interface ITransferenciaEstoqueService
{
    Task<TransferenciaEstoqueLeituraDTO> CriarEEnviarAsync(TransferenciaEstoqueCriacaoDTO dto, CancellationToken cancellationToken = default);
    Task<TransferenciaEstoqueLeituraDTO> ConfirmarRecebimentoAsync(int idTransferencia, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TransferenciaEstoqueLeituraDTO>> ListarAsync(CancellationToken cancellationToken = default);
}
