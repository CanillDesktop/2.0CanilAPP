using Backend.Models;
using Backend.Models.Usuarios;

namespace Backend.Repositories.Interfaces;

public interface IUsuariosRepository : ICRUDRepository<UsuariosModel>
{
    Task<UsuariosModel?> GetByEmailAsync(string email);
}