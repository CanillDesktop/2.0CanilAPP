using Backend.Context;
using Backend.Models.Estoque;
using Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories
{
    public class EstoqueItemRepository : IEstoqueItemRepository
    {
        private readonly CanilAppDbContext _context;

        public EstoqueItemRepository(CanilAppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ItemEstoqueModel>> GetAllByIdAsync(int id)
        {
            var itemEstoque = await _context.ItensEstoque
                .Where(r => r.IsDeleted == false)
                .Where(r => r.Id == id)
                .ToListAsync();

            return itemEstoque;
        }

        public async Task<ItemEstoqueModel?> GetByLoteAsync(string lote)
        {
            var itemEstoque = await _context.ItensEstoque
                .Where(r => r.IsDeleted == false)
                .FirstOrDefaultAsync(p => p.Lote == lote);

            return itemEstoque;
        }

        public async Task<ItemEstoqueModel> CreateAsync(ItemEstoqueModel model)
        {
            ArgumentNullException.ThrowIfNull(model);

            _context.ItensEstoque.Add(model);
            await _context.SaveChangesAsync();

            return model;
        }

        public async Task<ItemEstoqueModel?> UpdateAsync(ItemEstoqueModel model)
        {
            ArgumentNullException.ThrowIfNull(model);

            _context.Entry(model).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return model;
        }

        public async Task<bool> DeleteAsync(ItemEstoqueModel model)
        {
            _context.ItensEstoque.Update(model);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
