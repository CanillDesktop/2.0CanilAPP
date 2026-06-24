using Backend.Context;
using Backend.Models.Estoque;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories
{
    public abstract class BaseCRUDEstoqueRepository<T> : ICRUDEstoqueRepository<T> where T : ItemComEstoqueBaseModel
    {
        protected readonly CanilAppDbContext _context;
        protected readonly IUnidadeEstoqueContextService _unidadeContext;

        public BaseCRUDEstoqueRepository(CanilAppDbContext context, IUnidadeEstoqueContextService unidadeContext)
        {
            _context = context;
            _unidadeContext = unidadeContext;
        }

        public async Task<IEnumerable<T>> GetAsync()
        {
            var idUnidade = await _unidadeContext.ObterUnidadeAtivaIdAsync();
            await _unidadeContext.GarantirConsultaAsync(idUnidade);

            var registros = await _context.Set<T>()
                .Include(p => p.ItensNivelEstoque.Where(n => n.IdUnidadeEstoque == idUnidade && !n.IsDeleted))
                .Include(p => p.ItensEstoque.Where(e => e.IdUnidadeEstoque == idUnidade && !e.IsDeleted))
                .Where(p => p.IsDeleted == false)
                .ToListAsync();

            return registros;
        }

        public async Task<T?> GetByIdAsync(int id)
        {
            var idUnidade = await _unidadeContext.ObterUnidadeAtivaIdAsync();
            await _unidadeContext.GarantirConsultaAsync(idUnidade);

            var registro = await _context.Set<T>()
                .Include(p => p.ItensEstoque.Where(e => e.IdUnidadeEstoque == idUnidade && !e.IsDeleted))
                .Include(p => p.ItensNivelEstoque.Where(n => n.IdUnidadeEstoque == idUnidade && !n.IsDeleted))
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
