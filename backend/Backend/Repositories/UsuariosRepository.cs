using Backend.Context;
using Backend.Models.Usuarios;
using Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

public class UsuariosRepository : BaseCRUDRepository<UsuariosModel>, IUsuariosRepository
{
    public UsuariosRepository(CanilAppDbContext context) : base(context) { }

    public async Task<UsuariosModel?> GetByEmailAsync(string email)
    {
        return await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Email == email);
    }
}