using Backend.Context;
using Backend.Models.Estoque;
using Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories
{
    public abstract class BaseCRUDEstoqueRepository<T> : ICRUDEstoqueRepository<T> where T : ItemComEstoqueBaseModel
    {
        protected readonly CanilAppDbContext _context;

        public BaseCRUDEstoqueRepository(CanilAppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<T>> GetAsync()
        {
            var registros = await _context.Set<T>()
                .Include(p => p.ItemNivelEstoque)
                .Include(p => p.ItensEstoque)
                .Where(p => p.IsDeleted == false)
                .ToListAsync();

            return registros;
        }

        public async Task<T?> GetByIdAsync(int id)
        {
            var registro = await _context.Set<T>()
                .Include(p => p.ItensEstoque)
                .Include(p => p.ItemNivelEstoque)
                .Where(p => p.IsDeleted == false)
                .FirstOrDefaultAsync(p => p.Id == id);

            return registro;
        }

        public async Task<T> CreateAsync(T model)
        {
            ArgumentNullException.ThrowIfNull(model);

            _context.Set<T>().Add(model);
            await _context.SaveChangesAsync();

            return model;
        }

        public async Task<T?> UpdateAsync(T model)
        {
            ArgumentNullException.ThrowIfNull(model);

            _context.Entry(model).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return model;
        }

        public async Task<bool> DeleteAsync(T registro)
        {
            _context.Set<T>().Update(registro);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
