using Backend.DTOs.Cargos;

namespace Backend.Services.Interfaces;

public interface ICargoPermissaoAtribuicaoService
{
    Task<CargoPermissoesEditorDTO> ObterEditorAsync(int idCargo, CancellationToken cancellationToken = default);
    Task SalvarAsync(int idCargo, CargoPermissoesSalvarDTO dto, CancellationToken cancellationToken = default);
}
