using Backend.Context;
using Backend.DTOs.Estoque;
using Backend.Exceptions;
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
    private readonly ILogger<RetiradaEstoqueService> _logger;

    public RetiradaEstoqueService(
        IRetiradaEstoqueRepository retiradaRepository,
        CanilAppDbContext context,
        IUserSessionService userSessionService,
        ILogger<RetiradaEstoqueService> logger)
    {
        _retiradaRepository = retiradaRepository;
        _context = context;
        _userSessionService = userSessionService;
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
                await _context.Usuarios.AsNoTracking().AnyAsync(u => u.Id == recId && !u.IsDeleted);
            if (!recebedorExiste)
                throw new ModelIncompletaException("Usuário recebedor informado não foi encontrado ou está inativo.");
        }

        await using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // Busca por chave única (Código + Lote), ignorando registros logicamente excluídos.
            var chave = await _context.ItensEstoque.AsNoTracking()
                .Where(e => e.Lote == dto.Lote && e.Codigo == dto.Codigo && !e.IsDeleted)
                .Select(e => new { e.Id, e.Lote, e.Codigo, e.DataValidade })
                .FirstOrDefaultAsync();

            if (chave == null)
            {
                // Item 15: se o lote existe mas o código diverge, a operação é cancelada.
                var loteExisteComOutroCodigo = await _context.ItensEstoque.AsNoTracking()
                    .AnyAsync(e => e.Lote == dto.Lote && !e.IsDeleted);

                if (loteExisteComOutroCodigo)
                {
                    throw new RegraDeNegocioInfringidaException(
                        "O código informado não corresponde ao item do lote. Operação cancelada.");
                }

                throw new ArgumentNullException(null,
                    $"Item de estoque de lote {dto.Lote} não encontrado");
            }

            var now = DateTime.UtcNow;
            var editor = _userSessionService.EditedBy ?? string.Empty;

            // Item 10: lote vencido exige confirmação explícita; quando autorizado, fica registrado no histórico.
            var estavaVencido = chave.DataValidade.HasValue && chave.DataValidade.Value.Date < now.Date;
            if (estavaVencido && !confirmarLoteVencido)
            {
                throw new LoteVencidoPrecisaConfirmacaoException(chave.DataValidade!.Value);
            }

            dto.DataHoraRetirada = now;
            dto.Status = RetiradaEstoqueStatus.Confirmada;
            dto.EstavaVencido = estavaVencido;
            dto.DataValidadeLote = chave.DataValidade;

            // Item 9: valida o usuário retirante antes de gravar (evita violação de FK -> 500).
            if (int.TryParse(_userSessionService.UserId, out var usuarioLogado) && usuarioLogado > 0)
            {
                var retiranteExiste = await _context.Usuarios.AsNoTracking()
                    .AnyAsync(u => u.Id == usuarioLogado && !u.IsDeleted);
                dto.IdUsuarioRetirante = retiranteExiste ? usuarioLogado : null;
            }
            else
            {
                dto.IdUsuarioRetirante = null;
            }

            var linhasBaixa = await _context.ItensEstoque
                .Where(e =>
                    e.Id == chave.Id
                    && e.Lote == chave.Lote
                    && !e.IsDeleted
                    && e.Quantidade >= dto.Quantidade)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(e => e.Quantidade, e => e.Quantidade - dto.Quantidade)
                    .SetProperty(e => e.Versao, e => e.Versao + 1)
                    .SetProperty(e => e.DataHoraAtualizacao, _ => now)
                    .SetProperty(e => e.EditadorPor, _ => editor));

            if (linhasBaixa != 1)
            {
                throw new RegraDeNegocioInfringidaException(
                    EstoqueConcurrencyMessages.SaldoInsuficienteOuEstoqueAlterado);
            }

            // Item 18: lote zerado -> soft delete com auditoria (usuário e data).
            await _context.ItensEstoque
                .Where(e =>
                    e.Id == chave.Id
                    && e.Lote == chave.Lote
                    && !e.IsDeleted
                    && e.Quantidade == 0)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(e => e.IsDeleted, _ => true)
                    .SetProperty(e => e.Versao, e => e.Versao + 1)
                    .SetProperty(e => e.DataHoraAtualizacao, _ => now)
                    .SetProperty(e => e.EditadorPor, _ => editor));

            // Item 19: sem nenhum lote ativo restante -> soft delete do item pai (na mesma transação).
            var aindaTemLoteAtivo = await _context.ItensEstoque
                .AnyAsync(e => e.Id == chave.Id && !e.IsDeleted && e.Quantidade > 0);

            if (!aindaTemLoteAtivo)
            {
                var itemPai = await _context.Set<ItemComEstoqueBaseModel>()
                    .FirstOrDefaultAsync(p => p.Id == chave.Id && !p.IsDeleted);

                if (itemPai != null)
                {
                    itemPai.IsDeleted = true;
                    itemPai.DataHoraAtualizacao = now;
                    itemPai.EditadorPor = editor;
                }
            }

            await _retiradaRepository.CreateAsync(dto, saveChanges: false);
            await _context.SaveChangesAsync();
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
}
