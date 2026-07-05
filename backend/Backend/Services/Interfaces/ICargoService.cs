using Backend.DTOs.Cargos;

namespace Backend.Services.Interfaces;

public interface ICargoService
{
    Task<IReadOnlyList<CargoLeituraDTO>> ListarAsync(CancellationToken cancellationToken = default);
    Task<CargoLeituraDTO> CriarAsync(CargoCadastroDTO dto, CancellationToken cancellationToken = default);
    Task<CargoLeituraDTO> AtualizarAsync(int id, CargoAtualizacaoDTO dto, CancellationToken cancellationToken = default);
    Task ExcluirAsync(int id, CancellationToken cancellationToken = default);
}
