using Backend.Context;
using Backend.Models.Enums;
using Backend.Models.UnidadeMedida;
using Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

public class UnidadeMedidaRepository : IUnidadeMedidaRepository
{
    private readonly CanilAppDbContext _context;

    public UnidadeMedidaRepository(CanilAppDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<UnidadeMedidaModel>> ListarAsync(
        TipoItemUnidadeMedida? aplicavelA = null,
        bool apenasAtivas = true,
        CancellationToken cancellationToken = default)
    {
        var query = _context.UnidadesMedida.AsNoTracking().Where(u => !u.IsDeleted);

        if (apenasAtivas)
            query = query.Where(u => u.Ativa);

        if (aplicavelA is TipoItemUnidadeMedida tipo)
        {
            query = tipo switch
            {
                TipoItemUnidadeMedida.Produto => query.Where(u => u.AplicavelProduto),
                TipoItemUnidadeMedida.Medicamento => query.Where(u => u.AplicavelMedicamento),
                TipoItemUnidadeMedida.Insumo => query.Where(u => u.AplicavelInsumo),
                _ => query,
            };
        }

        return await query
            .OrderBy(u => u.Nome)
            .ToListAsync(cancellationToken);
    }

    public Task<UnidadeMedidaModel?> ObterPorIdAsync(int id, CancellationToken cancellationToken = default) =>
        _context.UnidadesMedida.FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted, cancellationToken);

    public Task<UnidadeMedidaModel?> ObterPorNomeAsync(string nome, CancellationToken cancellationToken = default)
    {
        var normalizado = nome.Trim().ToLowerInvariant();
        return _context.UnidadesMedida.FirstOrDefaultAsync(
            u => !u.IsDeleted && u.Nome.ToLower() == normalizado,
            cancellationToken);
    }

    public async Task<UnidadeMedidaModel> CriarAsync(UnidadeMedidaModel model, CancellationToken cancellationToken = default)
    {
        _context.UnidadesMedida.Add(model);
        await _context.SaveChangesAsync(cancellationToken);
        return model;
    }

    public async Task<UnidadeMedidaModel> AtualizarAsync(UnidadeMedidaModel model, CancellationToken cancellationToken = default)
    {
        _context.UnidadesMedida.Update(model);
        await _context.SaveChangesAsync(cancellationToken);
        return model;
    }

    public async Task<bool> ExisteAplicavelAsync(
        int id,
        TipoItemUnidadeMedida tipo,
        CancellationToken cancellationToken = default)
    {
        var query = _context.UnidadesMedida.AsNoTracking()
            .Where(u => u.Id == id && !u.IsDeleted && u.Ativa);

        query = tipo switch
        {
            TipoItemUnidadeMedida.Produto => query.Where(u => u.AplicavelProduto),
            TipoItemUnidadeMedida.Medicamento => query.Where(u => u.AplicavelMedicamento),
            TipoItemUnidadeMedida.Insumo => query.Where(u => u.AplicavelInsumo),
            _ => query.Where(_ => false),
        };

        return await query.AnyAsync(cancellationToken);
    }
}
