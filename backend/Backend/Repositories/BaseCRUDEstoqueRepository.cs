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
                .Include(p => p.ItensEstoque
                    .Where(e => e.IdUnidadeEstoque == idUnidade && !e.IsDeleted)
                    .OrderByDescending(e => e.DataHoraCriacao))
                .Where(p => !p.IsDeleted
                    && (p.ItensEstoque.Any(e => e.IdUnidadeEstoque == idUnidade && !e.IsDeleted)
                        || p.ItensNivelEstoque.Any(n => n.IdUnidadeEstoque == idUnidade && !n.IsDeleted)))
                .ToListAsync();

            return registros;
        }

        public async Task<T?> GetByIdAsync(int id)
        {
            var idUnidade = await _unidadeContext.ObterUnidadeAtivaIdAsync();
            await _unidadeContext.GarantirConsultaAsync(idUnidade);

            var registro = await _context.Set<T>()
                .Include(p => p.ItensEstoque
                    .Where(e => e.IdUnidadeEstoque == idUnidade && !e.IsDeleted)
                    .OrderByDescending(e => e.DataHoraCriacao))
                .Include(p => p.ItensNivelEstoque.Where(n => n.IdUnidadeEstoque == idUnidade && !n.IsDeleted))
                .Where(p => !p.IsDeleted
                    && (p.ItensEstoque.Any(e => e.IdUnidadeEstoque == idUnidade && !e.IsDeleted)
                        || p.ItensNivelEstoque.Any(n => n.IdUnidadeEstoque == idUnidade && !n.IsDeleted)))
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

        /// <summary>
        /// Remove o item apenas da unidade ativa (lotes e nível mínimo).
        /// O catálogo global só é excluído se não restar presença em nenhuma unidade.
        /// </summary>
        public async Task<bool> DeleteNaUnidadeAtivaAsync(int id, string editor)
        {
            var idUnidade = await _unidadeContext.ObterUnidadeAtivaIdAsync();
            await _unidadeContext.GarantirConsultaAsync(idUnidade);

            var item = await _context.Set<T>()
                .Include(p => p.ItensEstoque
                    .Where(e => e.IdUnidadeEstoque == idUnidade && !e.IsDeleted)
                    .OrderByDescending(e => e.DataHoraCriacao))
                .Include(p => p.ItensNivelEstoque.Where(n => n.IdUnidadeEstoque == idUnidade && !n.IsDeleted))
                .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);

            if (item is null)
                return false;

            var lotesUnidade = item.ItensEstoque.ToList();
            var niveisUnidade = item.ItensNivelEstoque.ToList();
            if (lotesUnidade.Count == 0 && niveisUnidade.Count == 0)
                return false;

            var now = DateTime.UtcNow;
            var editadoPor = editor ?? string.Empty;

            foreach (var lote in lotesUnidade)
            {
                lote.IsDeleted = true;
                lote.DataHoraAtualizacao = now;
                lote.EditadorPor = editadoPor;
            }

            foreach (var nivel in niveisUnidade)
            {
                nivel.IsDeleted = true;
                nivel.DataHoraAtualizacao = now;
                nivel.EditadorPor = editadoPor;
            }

            var aindaEmOutraUnidade =
                await _context.ItensEstoque.AnyAsync(e =>
                    e.Id == id && !e.IsDeleted && e.IdUnidadeEstoque != idUnidade)
                || await _context.ItensNivelEstoque.AnyAsync(n =>
                    n.Id == id && !n.IsDeleted && n.IdUnidadeEstoque != idUnidade);

            if (!aindaEmOutraUnidade)
            {
                item.IsDeleted = true;
                item.DataHoraAtualizacao = now;
                item.EditadorPor = editadoPor;
            }

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
