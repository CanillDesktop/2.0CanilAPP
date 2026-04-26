using Backend.Context;
using Backend.Models.Enums;
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

    public async Task<int> CountAsync()
    {
        return await _context.Usuarios.CountAsync();
    }

    public async Task<int> CountAdminsAtivosAsync()
    {
        return await _context.Usuarios.CountAsync(u => u.Permissao == PermissoesEnum.ADMIN && !u.IsDeleted);
    }

    public async Task<int> CountAdminsAtivosExcetoAsync(int usuarioId)
    {
        return await _context.Usuarios.CountAsync(u =>
            u.Permissao == PermissoesEnum.ADMIN && !u.IsDeleted && u.Id != usuarioId);
    }
}