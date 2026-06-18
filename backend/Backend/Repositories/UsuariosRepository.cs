using Backend.Context;
using Backend.DTOs.Usuario;
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

        return await _context.Usuarios.CountAsync();
    }

    public async Task<IReadOnlyList<UsuarioResumoFiltroDTO>> ListarResumoParaFiltrosAsync(
        CancellationToken cancellationToken = default)
    {
        return await _context.Usuarios.AsNoTracking()
            .Where(u => !u.IsDeleted)
            .OrderBy(u => u.PrimeiroNome)
            .ThenBy(u => u.Sobrenome)
            .Select(u => new UsuarioResumoFiltroDTO
            {
                Id = u.Id,
                NomeExibicao =
                    string.IsNullOrWhiteSpace(u.Sobrenome)
                        ? u.PrimeiroNome
                        : (u.PrimeiroNome + " " + u.Sobrenome!).Trim(),
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<UsuariosModel>> ListarTodosIncluindoInativosAsync()
    {
        return await _context.Usuarios.AsNoTracking().ToListAsync();
    }

    public async Task<UsuariosModel?> GetByIdIncluindoInativosAsync(int id)
    {
        return await _context.Usuarios.FirstOrDefaultAsync(u => u.Id == id);
    }
}