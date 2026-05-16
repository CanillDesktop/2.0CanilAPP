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
        RetiradaEstoqueParameters parameters,
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
        var parametrosPagina = new RetiradaEstoqueParameters
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

    public async Task<RetiradaEstoqueModel?> CriarAsync(string lote, RetiradaEstoqueModel dto)
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
            var chave = await _context.ItensEstoque.AsNoTracking()
                .Where(e => e.Lote == dto.Lote && !e.IsDeleted)
                .Select(e => new { e.Id, e.Lote })
                .FirstOrDefaultAsync();

            if (chave == null)
            {
                throw new ArgumentNullException(null,
                    $"Item de estoque de lote {dto.Lote} não encontrado");
            }

            var now = DateTime.UtcNow;
            var editor = _userSessionService.EditedBy ?? string.Empty;

            dto.DataHoraRetirada = now;
            dto.Status = RetiradaEstoqueStatus.Confirmada;

            if (int.TryParse(_userSessionService.UserId, out var usuarioLogado))
                dto.IdUsuarioRetirante = usuarioLogado;

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

            await _context.ItensEstoque
                .Where(e =>
                    e.Id == chave.Id
                    && e.Lote == chave.Lote
                    && !e.IsDeleted
                    && e.Quantidade == 0)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(e => e.IsDeleted, _ => true)
                    .SetProperty(e => e.Versao, e => e.Versao + 1)
                    .SetProperty(e => e.DataHoraAtualizacao, _ => now));

            await _retiradaRepository.CreateAsync(dto, saveChanges: false);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            _logger.LogInformation(
                "Retirada de estoque persistida. Lote={Lote}, Quantidade={Quantidade}, IdRetirada={IdRetirada}",
                dto.Lote,
                dto.Quantidade,
                dto.Id);

            return dto;
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
