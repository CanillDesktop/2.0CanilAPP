using Backend.Context;
using Backend.DTOs.Estoque;
using Backend.Exceptions;
using Backend.Models.Enums;
using Backend.Models.Estoque;
using Backend.Pagination;
using Backend.Repositories;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Backend.Services;

public class RetiradaEstoqueService : IRetiradaEstoqueService
{
    private readonly IRetiradaEstoqueRepository _retiradaRepository;
    private readonly CanilAppDbContext _context;
    private readonly IUserSessionService _userSessionService;
    private readonly IUnidadeEstoqueContextService _unidadeContext;
    private readonly ILogger<RetiradaEstoqueService> _logger;

    public RetiradaEstoqueService(
        IRetiradaEstoqueRepository retiradaRepository,
        CanilAppDbContext context,
        IUserSessionService userSessionService,
        IUnidadeEstoqueContextService unidadeContext,
        ILogger<RetiradaEstoqueService> logger)
    {
        _retiradaRepository = retiradaRepository;
        _context = context;
        _userSessionService = userSessionService;
        _unidadeContext = unidadeContext;
        _logger = logger;
    }

    public async Task<IEnumerable<RetiradaEstoqueModel>> BuscarTodosAsync() =>
        await _retiradaRepository.GetAsync();

    public async Task<RetiradaEstoqueHistoricoListaPaginadaDTO> ConsultarHistoricoPaginadoAsync(
        RetiradaEstoqueFiltroDTO filtro,
        RetiradaEstoquePaginationParameters parameters,
        CancellationToken cancellationToken = default)
    {
        var janela = RetiradaEstoqueFiltrosResolver.ResolverPeriodoOuDatas(filtro);

        var idRetiranteLista =
            filtro.IdUsuarioRetirante.HasValue && filtro.IdUsuarioRetirante.Value > 0
                ? filtro.IdUsuarioRetirante
                : null;
        var idRecebedorLista =
            filtro.IdUsuarioRecebedor.HasValue && filtro.IdUsuarioRecebedor.Value > 0
                ? filtro.IdUsuarioRecebedor
                : null;

        var consultaFiltros = new RetiradaEstoqueFiltroConsulta(
            janela.InicioUtcInclusive,
            janela.FimUtcInclusive,
            idRetiranteLista,
            idRecebedorLista,
            string.IsNullOrWhiteSpace(filtro.TermoBusca) ? null : filtro.TermoBusca.Trim());

        var pageNumber = Math.Max(parameters.PageNumber, 1);
        var parametrosPagina = new RetiradaEstoquePaginationParameters
        {
            PageNumber = pageNumber,
            PageSize = parameters.PageSize,
            OrdemDataAscendente = parameters.OrdemDataAscendente,
        };

        var consulta = await _retiradaRepository.ConsultarHistoricoAsync(
            consultaFiltros,
            parametrosPagina,
            cancellationToken);

        var totalPages = consulta.TotalRegistrosIntersecao == 0
            ? 0
            : (int)Math.Ceiling(consulta.TotalRegistrosIntersecao / (double)parametrosPagina.PageSize);

        var metricas = new RetiradaEstoqueMetricasFiltragemDTO
        {
            TotalRegistrosNoRecorte = consulta.TotalRegistrosIntersecao,
            SomaQuantidadeItens = consulta.SomaQuantidadeIntersecao,
            TotalRetiradasFeitasPorUsuarioRetiranteFiltro = consulta.TotalComoSomenteRetirante,
            TotalRetiradasRecebidasPorUsuarioRecebedorFiltro = consulta.TotalComoSomenteRecebedor,
        };

        return new RetiradaEstoqueHistoricoListaPaginadaDTO
        {
            Items = consulta.Linhas.ToList(),
            TotalCount = consulta.TotalRegistrosIntersecao,
            PageNumber = pageNumber,
            PageSize = parametrosPagina.PageSize,
            TotalPages = totalPages,
            Metricas = metricas,
            DataInicioUtcAplicada = janela.InicioUtcInclusive,
            DataFimUtcInclusiveAplicada = janela.FimUtcInclusive,
        };
    }

    public async Task<RetiradaEstoqueModel?> CriarAsync(string lote, RetiradaEstoqueModel dto, bool confirmarLoteVencido = false)
    {
        if (lote != dto.Lote)
        {
            throw new ArgumentException(
                "O lote do produto requisitado não bate com a rota. Favor contatar suporte");
        }

        if (dto.Quantidade <= 0)
        {
            throw new ModelIncompletaException("A quantidade da retirada deve ser maior que zero.");
        }

        if (string.IsNullOrWhiteSpace(dto.Codigo)
            || string.IsNullOrWhiteSpace(dto.NomeOuDescricaoSimples)
            || string.IsNullOrWhiteSpace(dto.De)
            || string.IsNullOrWhiteSpace(dto.Para))
        {
            throw new ModelIncompletaException("Um ou mais campos obrigatórios não foram preenchidos");
        }

        if (dto.IdUsuarioRecebedor.HasValue && dto.IdUsuarioRecebedor.Value > 0)
        {
            var recId = dto.IdUsuarioRecebedor.Value;
            var recebedorExiste =
                await _context.Usuarios.AsNoTracking().AnyAsync(u => u.Id == recId && u.Status == StatusUsuario.Ativo);
            if (!recebedorExiste)
                throw new ModelIncompletaException("Usuário recebedor informado não foi encontrado ou está inativo.");
        }

        await using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var idUnidade = await _unidadeContext.ObterUnidadeAtivaIdAsync();
            await _unidadeContext.GarantirSaidaAsync(idUnidade);

            var chave = await _context.ItensEstoque.AsNoTracking()
                .Where(e => e.Lote == dto.Lote && e.Codigo == dto.Codigo && e.IdUnidadeEstoque == idUnidade && !e.IsDeleted)
                .Select(e => new { e.Id, e.Lote, e.Codigo, e.DataValidade, e.Quantidade })
                .FirstOrDefaultAsync();

            if (chave == null)
            {
                var loteExisteComOutroCodigo = await _context.ItensEstoque.AsNoTracking()
                    .AnyAsync(e => e.Lote == dto.Lote && e.IdUnidadeEstoque == idUnidade && !e.IsDeleted);

                if (loteExisteComOutroCodigo)
                {
                    throw new RegraDeNegocioInfringidaException(
                        "O código informado não corresponde ao item do lote. Operação cancelada.");
                }

                throw new ArgumentNullException(null,
                    $"Item de estoque de lote {dto.Lote} não encontrado");
            }

            var codigoEsperado = await ResolverCodigoItemAsync(chave.Id);
            var codigoReferencia = !string.IsNullOrWhiteSpace(chave.Codigo) ? chave.Codigo : codigoEsperado;

            if (string.IsNullOrWhiteSpace(codigoReferencia)
                || !string.Equals(dto.Codigo, codigoReferencia, StringComparison.Ordinal))
            {
                throw new RegraDeNegocioInfringidaException(
                    "O código informado não corresponde ao item do lote. Operação cancelada.");
            }

            var now = DateTime.UtcNow;
            var editor = _userSessionService.EditedBy ?? string.Empty;

            var estavaVencido = chave.DataValidade.HasValue && chave.DataValidade.Value.Date < now.Date;
            if (estavaVencido && !confirmarLoteVencido)
            {
                throw new LoteVencidoPrecisaConfirmacaoException(chave.DataValidade!.Value);
            }

            dto.IdUnidadeEstoque = idUnidade;
            dto.DataHoraRetirada = now;
            dto.Status = RetiradaEstoqueStatus.Confirmada;
            dto.EstavaVencido = estavaVencido;
            dto.DataValidadeLote = chave.DataValidade;

            int? idUsuarioLogado = null;
            if (int.TryParse(_userSessionService.UserId, out var usuarioLogado) && usuarioLogado > 0)
            {
                var retiranteExiste = await _context.Usuarios.AsNoTracking()
                    .AnyAsync(u => u.Id == usuarioLogado && u.Status == StatusUsuario.Ativo);
                dto.IdUsuarioRetirante = retiranteExiste ? usuarioLogado : null;
                idUsuarioLogado = retiranteExiste ? usuarioLogado : null;
            }
            else
            {
                dto.IdUsuarioRetirante = null;
            }

            var linhasBaixa = await _context.ItensEstoque
                .Where(e =>
                    e.Id == chave.Id
                    && e.Lote == chave.Lote
                    && e.IdUnidadeEstoque == idUnidade
                    && !e.IsDeleted
                    && e.Quantidade >= dto.Quantidade)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(e => e.Quantidade, e => e.Quantidade - dto.Quantidade)
                    .SetProperty(e => e.Versao, e => e.Versao + 1)
                    .SetProperty(e => e.DataHoraAtualizacao, _ => now)
                    .SetProperty(e => e.EditadorPor, _ => editor)
                    .SetProperty(e => e.Codigo, _ => codigoReferencia));

            if (linhasBaixa != 1)
            {
                throw new RegraDeNegocioInfringidaException(
                    EstoqueConcurrencyMessages.SaldoInsuficienteOuEstoqueAlterado);
            }

            var saldoApos = chave.Quantidade - dto.Quantidade;

            await _context.ItensEstoque
                .Where(e =>
                    e.Id == chave.Id
                    && e.Lote == chave.Lote
                    && e.IdUnidadeEstoque == idUnidade
                    && !e.IsDeleted
                    && e.Quantidade == 0)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(e => e.IsDeleted, _ => true)
                    .SetProperty(e => e.Versao, e => e.Versao + 1)
                    .SetProperty(e => e.DataHoraAtualizacao, _ => now)
                    .SetProperty(e => e.EditadorPor, _ => editor));

            // Não remove o item do catálogo global: saldo zerado em uma unidade
            // não deve apagar o cadastro nas demais unidades.

            await _retiradaRepository.CreateAsync(dto, saveChanges: false);
            await _context.SaveChangesAsync();

            if (idUsuarioLogado is int uid)
            {
                _context.MovimentacoesEstoque.Add(new MovimentacaoEstoqueModel
                {
                    IdUnidadeEstoque = idUnidade,
                    IdItem = chave.Id,
                    Lote = chave.Lote,
                    Quantidade = -dto.Quantidade,
                    SaldoAposMovimentacao = saldoApos,
                    TipoMovimentacao = TipoMovimentacaoEstoqueEnum.Saida,
                    IdRetirada = dto.Id,
                    IdUsuario = uid,
                    DataHoraMovimentacao = now,
                    Observacao = dto.Observacao,
                });
                await _context.SaveChangesAsync();
            }

            await transaction.CommitAsync();

            _logger.LogInformation(
                "Retirada de estoque persistida. Lote={Lote}, Quantidade={Quantidade}, EstavaVencido={EstavaVencido}, IdRetirada={IdRetirada}",
                dto.Lote,
                dto.Quantidade,
                dto.EstavaVencido,
                dto.Id);

            return dto;
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(
                ex,
                "Conflito de concorrência ao persistir retirada de estoque; rollback. Lote={Lote}",
                dto.Lote);
            await transaction.RollbackAsync();
            throw new RegraDeNegocioInfringidaException(
                EstoqueConcurrencyMessages.SaldoInsuficienteOuEstoqueAlterado, ex);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Falha ao persistir retirada de estoque; rollback da transação. Lote={Lote}, Quantidade={Quantidade}",
                dto.Lote,
                dto.Quantidade);
            await transaction.RollbackAsync();
            throw;
        }
    }

    private async Task<string?> ResolverCodigoItemAsync(int itemId)
    {
        var codigoProduto = await _context.Produtos.AsNoTracking()
            .Where(p => p.Id == itemId && !p.IsDeleted)
            .Select(p => p.Codigo)
            .FirstOrDefaultAsync();
        if (!string.IsNullOrWhiteSpace(codigoProduto))
            return codigoProduto;

        var codigoMedicamento = await _context.Medicamentos.AsNoTracking()
            .Where(m => m.Id == itemId && !m.IsDeleted)
            .Select(m => m.Codigo)
            .FirstOrDefaultAsync();
        if (!string.IsNullOrWhiteSpace(codigoMedicamento))
            return codigoMedicamento;

        return await _context.Insumos.AsNoTracking()
            .Where(i => i.Id == itemId && !i.IsDeleted)
            .Select(i => i.Codigo)
            .FirstOrDefaultAsync();
    }
}
