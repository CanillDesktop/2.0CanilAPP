using Backend.Context;
using Backend.DTOs.Usuario;
using Backend.Models.Cargos;
using Backend.Models.Enums;
using Backend.Models.Usuarios;
using Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Backend.Repositories;

public class UsuariosRepository : BaseCRUDRepository<UsuariosModel>, IUsuariosRepository
{
    public UsuariosRepository(CanilAppDbContext context) : base(context) { }

    public new async Task<UsuariosModel?> GetByIdAsync(int id)
    {
        return await _context.Usuarios
            .Include(u => u.Cargo)
            .FirstOrDefaultAsync(u => u.Id == id && u.Status == StatusUsuario.Ativo);
    }

    public async Task<UsuariosModel?> GetByIdGestaoAsync(int id)
    {
        return await _context.Usuarios
            .Include(u => u.Cargo)
            .FirstOrDefaultAsync(u => u.Id == id && u.Status != StatusUsuario.Excluido);
    }

    public async Task<UsuariosModel?> GetByIdExcluidoAsync(int id)
    {
        return await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Id == id && u.Status == StatusUsuario.Excluido);
    }

    public async Task<(IReadOnlyList<UsuariosModel> Items, int TotalCount)> ListarPaginadoAsync(
        StatusUsuario[] statusesPermitidos,
        string? busca,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Usuarios.AsNoTracking()
            .Where(u => statusesPermitidos.Contains(u.Status));

        if (!string.IsNullOrWhiteSpace(busca))
        {
            var termo = busca.Trim().ToLowerInvariant();
            query = query.Where(u =>
                u.Email.ToLower().Contains(termo)
                || u.PrimeiroNome.ToLower().Contains(termo)
                || (u.Sobrenome != null && u.Sobrenome.ToLower().Contains(termo)));
        }

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .Include(u => u.Cargo)
            .OrderBy(u => u.PrimeiroNome)
            .ThenBy(u => u.Sobrenome)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, total);
    }

    public async Task<UsuarioSessaoSnapshot?> ObterSnapshotSessaoAsync(int id)
    {
        return await _context.Usuarios
            .AsNoTracking()
            .Where(u => u.Id == id)
            .Select(u => new UsuarioSessaoSnapshot(u.Status, u.TokenVersion))
            .FirstOrDefaultAsync();
    }

    public async Task<UsuariosModel?> GetByEmailAsync(string email)
    {
        var emailNormalizado = email.Trim().ToLowerInvariant();
        return await _context.Usuarios
            .Include(u => u.Cargo)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == emailNormalizado);
    }

    public async Task<int> CountAsync(Expression<Func<UsuariosModel, bool>>? predicate = null)
    {
        if (predicate != null)
            return await _context.Usuarios.CountAsync(predicate);

        return await _context.Usuarios.CountAsync();
    }

    public async Task<IReadOnlyList<UsuarioResumoFiltroDTO>> ListarResumoParaFiltrosAsync(
        CancellationToken cancellationToken = default)
    {
        return await _context.Usuarios.AsNoTracking()
            .Where(u => u.Status == StatusUsuario.Ativo)
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
}
