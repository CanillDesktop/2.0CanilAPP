using Backend.Context;
using Backend.Models.Estoque;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories
{
    public class EstoqueItemRepository : IEstoqueItemRepository
    {
        private readonly CanilAppDbContext _context;
        private readonly IUnidadeEstoqueContextService _unidadeContext;

        public EstoqueItemRepository(CanilAppDbContext context, IUnidadeEstoqueContextService unidadeContext)
        {
            _context = context;
            _unidadeContext = unidadeContext;
        }

        public async Task<IEnumerable<ItemEstoqueModel>> GetByCodigoAsync(string codigo)
        {
            var idUnidade = await _unidadeContext.ObterUnidadeAtivaIdAsync();
            await _unidadeContext.GarantirConsultaAsync(idUnidade);

            return await _context.ItensEstoque
                .Where(r => r.IsDeleted == false)
                .Where(r => r.Codigo == codigo && r.IdUnidadeEstoque == idUnidade)
                .ToListAsync();
        }

        public async Task<ItemEstoqueModel?> GetByLoteAsync(string lote)
        {
            var idUnidade = await _unidadeContext.ObterUnidadeAtivaIdAsync();
            await _unidadeContext.GarantirConsultaAsync(idUnidade);

            return await _context.ItensEstoque
                .Where(r => r.IsDeleted == false)
                .Where(r => r.Lote == lote && r.IdUnidadeEstoque == idUnidade)
                .FirstOrDefaultAsync();
        }

        public async Task<ItemComEstoqueBaseModel?> ObterItemBasePorIdAsync(int id) =>
            await _context.Set<ItemComEstoqueBaseModel>()
                .FirstOrDefaultAsync(i => i.Id == id && !i.IsDeleted);

        public async Task<ItemEstoqueModel> CreateAsync(ItemEstoqueModel model, bool saveChanges = true)
        {
            ArgumentNullException.ThrowIfNull(model);

            _context.ItensEstoque.Add(model);
            if (saveChanges)
                await _context.SaveChangesAsync();

            return model;
        }

        public async Task<ItemEstoqueModel?> UpdateAsync(ItemEstoqueModel model, bool saveChanges = true)
        {
            ArgumentNullException.ThrowIfNull(model);

            _context.Entry(model).State = EntityState.Modified;
            if (saveChanges)
                await _context.SaveChangesAsync();
            return model;
        }

        public async Task<bool> DeleteAsync(ItemEstoqueModel model, bool saveChanges = true)
        {
            _context.ItensEstoque.Update(model);
            if (saveChanges)
                await _context.SaveChangesAsync();

            return true;
        }
    }
}
