using Backend.Context;
using Backend.DTOs.Insumos;
using Backend.Models.Insumos;
using Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories
{
    public class InsumosRepository : BaseCRUDEstoqueRepository<InsumosModel>, IInsumosRepository
    {
        public InsumosRepository(CanilAppDbContext context) : base(context) { }

        public async Task<IEnumerable<InsumosModel>> GetAsync(InsumosFiltroDTO filtro)
        {
            ArgumentNullException.ThrowIfNull(filtro);

            var query = _context.Insumos
                .Include(i => i.ItensEstoque)
                .Include(i => i.ItemNivelEstoque)
                .Include(i => i.IsDeleted == false)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(filtro.CodInsumo))
                query = query.Where(i => i.Codigo!.Contains(filtro.CodInsumo));

            if (!string.IsNullOrWhiteSpace(filtro.DescricaoSimplificada))
                query = query.Where(i => i.DescricaoSimplificada!.Contains(filtro.DescricaoSimplificada));

            if (!string.IsNullOrWhiteSpace(filtro.NFe))
                query = query.Where(i => i.ItensEstoque!.Any(e => !string.IsNullOrWhiteSpace(e.NFe) && e.NFe.Contains(filtro.NFe)));

            if (filtro.DataEntrega != null)
                query = query.Where(i => i.ItensEstoque!.Any(i => i.DataEntrega == filtro.DataEntrega));


            if (filtro.DataValidade != null)
                query = query.Where(i => i.ItensEstoque!.Any(e => e.DataValidade == filtro.DataValidade));

            var insumos = await query.ToListAsync();
            return insumos;
        }
    }
}



