using Backend.Models;
using Backend.Models.Usuarios;

namespace Backend.Repositories.Interfaces;

public interface IUsuariosRepository : ICRUDRepository<UsuariosModel>
{
    Task<UsuariosModel?> GetByEmailAsync(string email);
    Task<int> CountAsync();
    Task<int> CountAdminsAtivosAsync();
    Task<int> CountAdminsAtivosExcetoAsync(int usuarioId);
}