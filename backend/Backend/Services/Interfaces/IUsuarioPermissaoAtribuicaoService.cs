using Backend.DTOs.Permissoes;

namespace Backend.Services.Interfaces;

public interface IUsuarioPermissaoAtribuicaoService
{
    Task<UsuarioPermissoesEditorDTO> ObterEditorAsync(int idUsuario, CancellationToken cancellationToken = default);

    Task SalvarAsync(
        int idUsuario,
        UsuarioPermissoesSalvarDTO dto,
        CancellationToken cancellationToken = default);
}
