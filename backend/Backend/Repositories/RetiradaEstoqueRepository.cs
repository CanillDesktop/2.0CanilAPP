using Backend.Context;
using Backend.Models.Estoque;
using Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

public class RetiradaEstoqueRepository : IRetiradaEstoqueRepository
{
    private readonly CanilAppDbContext _context;

    public RetiradaEstoqueRepository(CanilAppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<RetiradaEstoqueModel>> GetAsync() =>
        await _context.RetiradaEstoque.ToListAsync();

    public async Task<RetiradaEstoqueModel?> CreateAsync(RetiradaEstoqueModel model, bool saveChanges = true)
    {
        await _context.RetiradaEstoque.AddAsync(model);

        if (saveChanges)
            await _context.SaveChangesAsync();

        return model;
    }
}
