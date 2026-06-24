using Backend.DTOs.Estoque;
using Backend.DTOs.Usuario;
using Backend.Models.Usuarios;
using Backend.Pagination;

namespace Backend.Services.Interfaces;

public interface IUsuariosService : ICRUDService<UsuariosModel>
{
    Task<Backend.DTOs.Common.PagedResultDto<UsuarioResponseDTO>> ListarPaginadoAsync(
        UsuarioListagemParameters parameters,
        CancellationToken cancellationToken = default);

    Task<UsuariosModel?> ValidarUsuarioAsync(string login, string senha);

    Task TrocarSenhaAsync(int id, string senhaAtual, string novaSenha);

    Task<bool?> InativarAsync(int id, string senha);

    Task<bool?> ReativarAsync(int id, string senha);

    Task<bool> DeletarAsync(int id, string senhaConfirmacao, bool hardDelete = false);

    Task<IReadOnlyList<UsuarioResumoFiltroDTO>> ListarResumoParaFiltrosHistoricoRetiradasAsync(
        CancellationToken cancellationToken = default);

    Task<UsuariosModel?> CriarAsync(UsuarioCriacaoComConfirmacaoRequestDTO dto);

    Task<UsuariosModel?> AtualizarAsync(int id, AtualizarUsuarioRequestDTO dto);

    Task<IReadOnlyList<UsuarioUnidadeEstoqueDTO>> ObterUnidadesEstoqueAsync(int idUsuario, CancellationToken cancellationToken = default);
}
