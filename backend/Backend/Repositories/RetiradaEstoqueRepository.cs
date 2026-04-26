using Backend.Context;
using Backend.Models.Estoque;
using Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories
{
    public class RetiradaEstoqueRepository : IRetiradaEstoqueRepository
    {
        private readonly CanilAppDbContext _context;

        public RetiradaEstoqueRepository(CanilAppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<RetiradaEstoqueModel>> GetAsync()
        {
            return await _context.RetiradaEstoque.ToListAsync();
        }

        public async Task<RetiradaEstoqueModel?> CreateAsync(RetiradaEstoqueModel model)
        {
            await _context.RetiradaEstoque.AddAsync(model);
            await _context.SaveChangesAsync();

            return model;
        }
    }
}