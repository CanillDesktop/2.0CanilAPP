using Backend.Context;
using Backend.DTOs.Estoque;
using Backend.Exceptions;
using Backend.Models.Enums;
using Backend.Models.Estoque;
using Backend.Models.Insumos;
using Backend.Models.Medicamentos;
using Backend.Models.Produtos;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class EntradaEstoqueService : IEntradaEstoqueService
{
    private readonly CanilAppDbContext _context;
    private readonly IUserSessionService _userSession;
    private readonly IUnidadeEstoqueContextService _unidadeContext;
    private readonly ILoteGeradorService _loteGerador;

    public EntradaEstoqueService(
        CanilAppDbContext context,
        IUserSessionService userSession,
        IUnidadeEstoqueContextService unidadeContext,
        ILoteGeradorService loteGerador)
    {
        _context = context;
        _userSession = userSession;
        _unidadeContext = unidadeContext;
        _loteGerador = loteGerador;
    }

    public async Task<ItemEstoqueModel> RegistrarEntradaAsync(EntradaEstoqueDTO dto, CancellationToken cancellationToken = default)
    {
        if (dto.Quantidade <= 0)
            throw new ModelIncompletaException("Informe uma quantidade maior que zero.");

        var idUnidade = await _unidadeContext.ObterUnidadeAtivaIdAsync(cancellationToken);
        await _unidadeContext.GarantirEntradaAsync(idUnidade, cancellationToken);

        if (dto.TipoEntrada == TipoEntradaEstoqueEnum.Compra && string.IsNullOrWhiteSpace(dto.NFe))
            throw new ModelIncompletaException("Informe a nota fiscal ou documento para entrada por compra.");

        if (dto.TipoEntrada == TipoEntradaEstoqueEnum.Doacao && string.IsNullOrWhiteSpace(dto.DoadorNome))
            throw new ModelIncompletaException("Informe o nome do doador para entrada por doação.");

        var itemBase = await _context.Set<ItemComEstoqueBaseModel>()
            .FirstOrDefaultAsync(i => i.Id == dto.IdItem && !i.IsDeleted, cancellationToken)
            ?? throw new RecursoNaoEncontradoException("Item não encontrado.");

        if (!int.TryParse(_userSession.UserId, out var idUsuario) || idUsuario <= 0)
            throw new AcessoNegadoException("Usuário não autenticado.");

        var codigo = ObterCodigo(itemBase);
        var lote = await GerarLoteAsync(itemBase);
        var now = DateTime.UtcNow;
        var editor = _userSession.EditedBy ?? string.Empty;

        var tipoMov = dto.TipoEntrada == TipoEntradaEstoqueEnum.Compra
            ? TipoMovimentacaoEstoqueEnum.Compra
            : TipoMovimentacaoEstoqueEnum.Doacao;

        await using var tx = await _context.Database.BeginTransactionAsync(cancellationToken);

        var linhaEstoque = new ItemEstoqueModel
        {
            Id = itemBase.Id,
            IdUnidadeEstoque = idUnidade,
            Codigo = codigo,
            Lote = lote,
            Quantidade = dto.Quantidade,
            DataEntrega = dto.DataEntrega,
            DataValidade = dto.DataValidade,
            NFe = dto.NFe,
            DataHoraCriacao = now,
            DataHoraAtualizacao = now,
            EditadorPor = editor,
        };

        _context.ItensEstoque.Add(linhaEstoque);

        if (dto.NivelMinimoEstoque is int minimo && minimo >= 0)
        {
            var nivel = await _context.ItensNivelEstoque
                .FirstOrDefaultAsync(n => n.Id == itemBase.Id && n.IdUnidadeEstoque == idUnidade && !n.IsDeleted, cancellationToken);

            if (nivel is null)
            {
                _context.ItensNivelEstoque.Add(new ItemNivelEstoqueModel
                {
                    Id = itemBase.Id,
                    IdUnidadeEstoque = idUnidade,
                    NivelMinimoEstoque = minimo,
                    DataHoraCriacao = now,
                    DataHoraAtualizacao = now,
                    EditadorPor = editor,
                });
            }
            else
            {
                nivel.NivelMinimoEstoque = minimo;
                nivel.DataHoraAtualizacao = now;
                nivel.EditadorPor = editor;
            }
        }

        var movimentacao = new MovimentacaoEstoqueModel
        {
            IdUnidadeEstoque = idUnidade,
            IdItem = itemBase.Id,
            Lote = lote,
            Quantidade = dto.Quantidade,
            SaldoAposMovimentacao = dto.Quantidade,
            TipoMovimentacao = tipoMov,
            IdUsuario = idUsuario,
            DataHoraMovimentacao = now,
            Observacao = dto.Observacao,
            NFe = dto.NFe,
            FornecedorNome = dto.FornecedorNome,
            FornecedorDocumento = dto.FornecedorDocumento,
            DoadorNome = dto.DoadorNome,
            DoadorDocumento = dto.DoadorDocumento,
        };

        _context.MovimentacoesEstoque.Add(movimentacao);
        await _context.SaveChangesAsync(cancellationToken);
        await tx.CommitAsync(cancellationToken);

        return linhaEstoque;
    }

    private static string ObterCodigo(ItemComEstoqueBaseModel item) => item switch
    {
        ProdutosModel p => p.Codigo,
        MedicamentosModel m => m.Codigo,
        InsumosModel i => i.Codigo,
        _ => throw new RegraDeNegocioInfringidaException("Tipo de item não suportado."),
    };

    private Task<string> GerarLoteAsync(ItemComEstoqueBaseModel item) => item switch
    {
        ProdutosModel p => _loteGerador.GerarLoteProdutoAsync(p.Categoria, p.DescricaoSimples),
        MedicamentosModel m => _loteGerador.GerarLoteMedicamentoAsync(m.PublicoAlvo, m.NomeComercial),
        InsumosModel i => _loteGerador.GerarLoteInsumoAsync(i.DescricaoSimplificada),
        _ => throw new RegraDeNegocioInfringidaException("Tipo de item não suportado."),
    };
}
