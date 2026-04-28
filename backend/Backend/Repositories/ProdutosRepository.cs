using Backend.Context;
using Backend.DTOs.Produtos;
using Backend.Models.Enums;
using Backend.Models.Produtos;
using Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories
{
    public class ProdutosRepository : BaseCRUDEstoqueRepository<ProdutosModel>, IProdutosRepository
    {
        public ProdutosRepository(CanilAppDbContext context) : base(context) { }

        public async Task<IEnumerable<ProdutosModel>> GetAsync(ProdutosFiltroDTO filtro)
        {
            ArgumentNullException.ThrowIfNull(filtro);

            var query = _context.Produtos
                .Include(p => p.ItensEstoque)
                .Include(p => p.ItemNivelEstoque)
                .Where(p => p.IsDeleted == false)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(filtro.CodProduto))
                query = query.Where(p => p.Codigo!.Contains(filtro.CodProduto));

            if (!string.IsNullOrWhiteSpace(filtro.DescricaoSimples))
                query = query.Where(p => p.DescricaoSimples!.Contains(filtro.DescricaoSimples));

            if (!string.IsNullOrWhiteSpace(filtro.NFe))
                query = query.Where(p => p.ItensEstoque!.Any(e => !string.IsNullOrWhiteSpace(e.NFe) && e.NFe.Contains(filtro.NFe)));

            if (Enum.IsDefined(typeof(CategoriaEnum), filtro.Categoria))
                query = query.Where(p => p.Categoria == (CategoriaEnum)filtro.Categoria);

            if (filtro.DataEntrega != null)
                query = query.Where(p => p.ItensEstoque!.Any(e => e.DataEntrega == filtro.DataEntrega));

            if (filtro.DataValidade != null)
                query = query.Where(p => p.ItensEstoque!.Any(e => e.DataValidade == filtro.DataValidade));

            var produtos = await query.ToListAsync();
            return produtos;
        }
    }
}