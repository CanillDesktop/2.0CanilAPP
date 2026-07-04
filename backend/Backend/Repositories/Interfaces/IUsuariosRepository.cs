using Backend.DTOs.Usuario;
using Backend.Models.Enums;
using Backend.Models.Usuarios;
using System.Linq.Expressions;

namespace Backend.Repositories.Interfaces;

public record UsuarioSessaoSnapshot(StatusUsuario Status, int TokenVersion);

public interface IUsuariosRepository : ICRUDRepository<UsuariosModel>
{
    Task<UsuariosModel?> GetByEmailAsync(string email);
    Task<int> CountAsync(Expression<Func<UsuariosModel, bool>>? predicate = null);

    Task<IReadOnlyList<UsuarioResumoFiltroDTO>> ListarResumoParaFiltrosAsync(
        CancellationToken cancellationToken = default);

    /// <summary>Usuário ativo (operacional e autenticação).</summary>
    new Task<UsuariosModel?> GetByIdAsync(int id);

    /// <summary>Ativo ou inativo — gestão admin (reativar, excluir lógico).</summary>
    Task<UsuariosModel?> GetByIdGestaoAsync(int id);

    /// <summary>Somente usuários com status Excluido — hard delete.</summary>
    Task<UsuariosModel?> GetByIdExcluidoAsync(int id);

    Task<(IReadOnlyList<UsuariosModel> Items, int TotalCount)> ListarPaginadoAsync(
        StatusUsuario[] statusesPermitidos,
        string? busca,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default);

    Task<UsuarioSessaoSnapshot?> ObterSnapshotSessaoAsync(int id);
}
