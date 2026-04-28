using Backend.Context;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories
{
    public abstract class BaseCRUDRepository<T> : ICRUDRepository<T> where T : BaseModel
    {
        protected readonly CanilAppDbContext _context;

        public BaseCRUDRepository(CanilAppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<T>> GetAsync()
        {
            var registros = await _context.Set<T>()
                .Where(r => r.IsDeleted == false)
                .ToListAsync();

            return registros;
        }

        public async Task<T?> GetByIdAsync(int id)
        {
            var registro = await _context.Set<T>()
                .Where(r => r.IsDeleted == false)
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

        public async Task<bool> DeleteAsync(T registro, bool hardDelete = false)
        {
            if (hardDelete == true)
            {
                _context.Set<T>().Remove(registro);
                await _context.SaveChangesAsync();
                return true;
            }

            _context.Set<T>().Update(registro);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
