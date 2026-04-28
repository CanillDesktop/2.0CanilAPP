using Backend.Context;
using Backend.DTOs.Medicamentos;
using Backend.Models.Enums;
using Backend.Models.Medicamentos;
using Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories
{
    public class MedicamentosRepository : BaseCRUDEstoqueRepository<MedicamentosModel>, IMedicamentosRepository
    {
        public MedicamentosRepository(CanilAppDbContext context) : base(context) { }

        public async Task<IEnumerable<MedicamentosModel>> GetAsync(MedicamentosFiltroDTO filtro)
        {
            ArgumentNullException.ThrowIfNull(filtro);

            var query = _context.Medicamentos
                .Include(m => m.ItensEstoque)
                .Include(m => m.ItemNivelEstoque)
                .Where(m => m.IsDeleted == false)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(filtro.CodMedicamento))
                query = query.Where(m => m.Codigo!.Contains(filtro.CodMedicamento));

            if (!string.IsNullOrWhiteSpace(filtro.NomeComercial))
                query = query.Where(m => m.NomeComercial!.Contains(filtro.NomeComercial));

            if (!string.IsNullOrWhiteSpace(filtro.Formula))
                query = query.Where(m => m.Formula!.Contains(filtro.Formula));

            if (!string.IsNullOrWhiteSpace(filtro.DescricaoMedicamento))
                query = query.Where(m => m.Descricao!.Contains(filtro.DescricaoMedicamento));

            if (!string.IsNullOrWhiteSpace(filtro.NFe))
                query = query.Where(m => m.ItensEstoque!.Any(e => !string.IsNullOrWhiteSpace(e.NFe) && e.NFe.Contains(filtro.NFe)));

            if (Enum.IsDefined(typeof(PrioridadeEnum), filtro.Prioridade))
                query = query.Where(m => m.Prioridade == (PrioridadeEnum)filtro.Prioridade);

            if (Enum.IsDefined(typeof(PublicoAlvoMedicamentoEnum), filtro.PublicoAlvo))
                query = query.Where(m => m.PublicoAlvo == (PublicoAlvoMedicamentoEnum)filtro.PublicoAlvo);

            if (filtro.DataEntrega != null)
                query = query.Where(m => m.ItensEstoque!.Any(e => e.DataEntrega == filtro.DataEntrega));

            if (filtro.DataValidade != null)
                query = query.Where(m => m.ItensEstoque!.Any(e => e.DataValidade == filtro.DataValidade));

            var medicamentos = await query.ToListAsync();
            return medicamentos;
        }
    }
}