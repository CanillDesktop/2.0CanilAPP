using Backend.Context;
using Backend.DTOs.Dashboard;
using Backend.DTOs.Estoque;
using Backend.Models.Estoque;
using Backend.Models.Insumos;
using Backend.Models.Medicamentos;
using Backend.Models.Produtos;
using Backend.Repositories;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class DashboardService : IDashboardService
{
    private readonly IEstoqueConsultaRepository _estoqueConsultaRepository;
    private readonly CanilAppDbContext _context;

    public DashboardService(
        IEstoqueConsultaRepository estoqueConsultaRepository,
        CanilAppDbContext context)
    {
        _estoqueConsultaRepository = estoqueConsultaRepository;
        _context = context;
    }

    public async Task<DashboardResumoDTO> ObterResumoAsync(CancellationToken cancellationToken = default)
    {
        var contagem = await _estoqueConsultaRepository.ObterContagemPorOrigemAsync(cancellationToken);

        return new DashboardResumoDTO
        {
            Produtos = contagem.Produtos,
            Medicamentos = contagem.Medicamentos,
            Insumos = contagem.Insumos,
            TotalItens = contagem.Produtos + contagem.Medicamentos + contagem.Insumos,
        };
    }

    public async Task<DashboardAlertasPaginadosDTO> ListarAlertasAsync(
        string tipo,
        string? origem,
        string? termo,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        pageNumber = Math.Max(pageNumber, 1);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var tipoNormalizado = (tipo ?? string.Empty).Trim().ToLowerInvariant();
        if (tipoNormalizado is not ("abaixo_minimo" or "proximo_vencimento"))
        {
            throw new ArgumentException("Tipo de alerta inválido. Use abaixo_minimo ou proximo_vencimento.");
        }

        var termoBusca = (termo ?? string.Empty).Trim();
        var origemNormalizada = (origem ?? string.Empty).Trim().ToLowerInvariant();
        var incluirProdutos = string.IsNullOrEmpty(origemNormalizada) || origemNormalizada == "produto";
        var incluirMedicamentos = string.IsNullOrEmpty(origemNormalizada) || origemNormalizada == "medicamento";
        var incluirInsumos = string.IsNullOrEmpty(origemNormalizada) || origemNormalizada == "insumo";

        var alertas = new List<DashboardAlertaItemDTO>();

        if (incluirProdutos)
        {
            var produtos = await FiltrarAlertasAsync(
                EstoqueConsultaQueryable.Base(_context.Produtos.AsQueryable()),
                tipoNormalizado,
                cancellationToken);
            alertas.AddRange(produtos.Select(p => ParaAlerta(EstoqueLinhaMapper.ParaDto(p, EstoqueOrigem.Produto), "produto")));
        }

        if (incluirMedicamentos)
        {
            var medicamentos = await FiltrarAlertasAsync(
                EstoqueConsultaQueryable.Base(_context.Medicamentos.AsQueryable()),
                tipoNormalizado,
                cancellationToken);
            alertas.AddRange(medicamentos.Select(m => ParaAlerta(EstoqueLinhaMapper.ParaDto(m, EstoqueOrigem.Medicamento), "medicamento")));
        }

        if (incluirInsumos)
        {
            var insumos = await FiltrarAlertasAsync(
                EstoqueConsultaQueryable.Base(_context.Insumos.AsQueryable()),
                tipoNormalizado,
                cancellationToken);
            alertas.AddRange(insumos.Select(i => ParaAlerta(EstoqueLinhaMapper.ParaDto(i, EstoqueOrigem.Insumo), "insumo")));
        }

        if (!string.IsNullOrEmpty(termoBusca))
        {
            alertas = alertas
                .Where(a => a.Nome.Contains(termoBusca, StringComparison.OrdinalIgnoreCase))
                .ToList();
        }

        var ordenados = alertas
            .OrderBy(a => a.Nome, StringComparer.OrdinalIgnoreCase)
            .ToList();

        var totalCount = ordenados.Count;
        var totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)pageSize);
        var items = ordenados
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return new DashboardAlertasPaginadosDTO
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalPages = totalPages,
        };
    }

    private static async Task<List<T>> FiltrarAlertasAsync<T>(
        IQueryable<T> query,
        string tipo,
        CancellationToken cancellationToken)
        where T : ItemComEstoqueBaseModel
    {
        if (tipo == "abaixo_minimo")
        {
            query = query.Where(x =>
                x.ItensEstoque.Where(e => !e.IsDeleted).Sum(e => e.Quantidade)
                < (x.ItemNivelEstoque != null ? x.ItemNivelEstoque.NivelMinimoEstoque : 0));
        }
        else
        {
            query = EstoqueConsultaQueryable.AplicarStatusOperacional(
                query,
                EstoqueStatusOperacional.ProximoVencimento);
        }

        return await query.AsNoTracking().ToListAsync(cancellationToken);
    }

    private static DashboardAlertaItemDTO ParaAlerta(EstoqueLinhaLeituraDTO dto, string origem) =>
        new()
        {
            Id = dto.Id,
            Nome = dto.Nome,
            Quantidade = dto.Quantidade,
            Minimo = dto.Minimo,
            Validade = dto.Validade,
            Origem = origem,
            Status = dto.StatusOperacional,
            UltimaMovimentacao = dto.UltimaMovimentacao,
            ValidadeMs = dto.MenorValidadeUtc.HasValue
                ? new DateTimeOffset(dto.MenorValidadeUtc.Value).ToUnixTimeMilliseconds()
                : null,
            MovimentacaoMs = dto.UltimaMovimentacaoUtc.HasValue
                ? new DateTimeOffset(dto.UltimaMovimentacaoUtc.Value).ToUnixTimeMilliseconds()
                : null,
        };
}
