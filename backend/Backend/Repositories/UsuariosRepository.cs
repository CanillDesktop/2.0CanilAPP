using Backend.Context;
using Backend.Models.Usuarios;
using Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Backend.Repositories;

public class UsuariosRepository : BaseCRUDRepository<UsuariosModel>, IUsuariosRepository
{
    public UsuariosRepository(CanilAppDbContext context) : base(context) { }

    public async Task<UsuariosModel?> GetByEmailAsync(string email)
    {
        return await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<int> CountAsync(Expression<Func<UsuariosModel, bool>>? predicate = null)
    {
        if (predicate != null)
        {
            return await _context.Usuarios.CountAsync(predicate);
        }
        else
        {
            return await _context.Usuarios.CountAsync();
        }
    }
}