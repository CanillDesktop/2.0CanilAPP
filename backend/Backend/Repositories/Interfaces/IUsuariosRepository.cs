using Backend.Models;
using Backend.Models.Usuarios;
using System.Linq.Expressions;

namespace Backend.Repositories.Interfaces;

public interface IUsuariosRepository : ICRUDRepository<UsuariosModel>
{
    Task<UsuariosModel?> GetByEmailAsync(string email);
    Task<int> CountAsync(Expression<Func<UsuariosModel, bool>>? predicate = null);
}