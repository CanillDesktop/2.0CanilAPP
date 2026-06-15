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

        public async Task<IEnumerable<ItemEstoqueModel>> GetByCodigoAsync(string codigo)
        {
            var itemEstoque = await _context.ItensEstoque
                .Where(r => r.IsDeleted == false)
                .Where(r => r.Codigo == codigo)
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

        public async Task<ItemComEstoqueBaseModel?> ObterItemBasePorIdAsync(int id)
        {
            // A herança TPT garante que o EF retorne a instância concreta
            // (ProdutosModel/MedicamentosModel/InsumosModel) ao consultar o tipo base.
            return await _context.Set<ItemComEstoqueBaseModel>()
                .FirstOrDefaultAsync(i => i.Id == id && !i.IsDeleted);
        }

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
