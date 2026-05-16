using Backend.DTOs.Estoque;
using Backend.Exceptions;
using Backend.Exportacao;
using Backend.Repositories;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;
using Microsoft.Extensions.Logging;

namespace Backend.Services;

public sealed class RetiradaEstoqueHistoricoExportService : IRetiradaEstoqueHistoricoExportService
{
    private readonly IRetiradaEstoqueRepository _retiradaRepository;
    private readonly ILogger<RetiradaEstoqueHistoricoExportService> _logger;

    public RetiradaEstoqueHistoricoExportService(
        IRetiradaEstoqueRepository retiradaRepository,
        ILogger<RetiradaEstoqueHistoricoExportService> logger)
    {
        _retiradaRepository = retiradaRepository;
        _logger = logger;
    }

    public Task<ArquivoExportadoDTO> ExportarHistoricoXlsxAsync(
        RetiradaEstoqueFiltroDTO filtro,
        bool ordemDataAscendente,
        CancellationToken cancellationToken = default) =>
        ExportarAsync(filtro, ordemDataAscendente, RetiradaEstoqueHistoricoExcelExportador.Gerar, cancellationToken);

    public Task<ArquivoExportadoDTO> ExportarHistoricoCsvAsync(
        RetiradaEstoqueFiltroDTO filtro,
        bool ordemDataAscendente,
        CancellationToken cancellationToken = default) =>
        ExportarAsync(filtro, ordemDataAscendente, RetiradaEstoqueHistoricoCsvExportador.Gerar, cancellationToken);

    private async Task<ArquivoExportadoDTO> ExportarAsync(
        RetiradaEstoqueFiltroDTO filtro,
        bool ordemDataAscendente,
        Func<IReadOnlyList<RetiradaEstoqueHistoricoItemDTO>, RetiradaEstoqueExportacaoContextoDTO, ArquivoExportadoDTO> gerarArquivo,
        CancellationToken cancellationToken)
    {
        try
        {
            var (itens, contexto) = await CarregarDadosExportacaoAsync(filtro, ordemDataAscendente, cancellationToken);
            return gerarArquivo(itens, contexto);
        }
        catch (ExportacaoRetiradasLimiteExcedidoException)
        {
            throw;
        }
        catch (ArgumentException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Falha ao gerar exportação do histórico de retiradas.");
            throw new InvalidOperationException(
                "Não foi possível gerar o arquivo de exportação. Tente novamente em instantes ou refine os filtros.",
                ex);
        }
    }

    private async Task<(IReadOnlyList<RetiradaEstoqueHistoricoItemDTO> Itens, RetiradaEstoqueExportacaoContextoDTO Contexto)>
        CarregarDadosExportacaoAsync(
            RetiradaEstoqueFiltroDTO filtro,
            bool ordemDataAscendente,
            CancellationToken cancellationToken)
    {
        var janela = RetiradaEstoqueFiltrosResolver.ResolverPeriodoOuDatas(filtro);

        var idRetiranteLista =
            filtro.IdUsuarioRetirante is > 0 ? filtro.IdUsuarioRetirante : null;
        var idRecebedorLista =
            filtro.IdUsuarioRecebedor is > 0 ? filtro.IdUsuarioRecebedor : null;

        var consultaFiltros = new RetiradaEstoqueFiltroConsulta(
            janela.InicioUtcInclusive,
            janela.FimUtcInclusive,
            idRetiranteLista,
            idRecebedorLista,
            string.IsNullOrWhiteSpace(filtro.TermoBusca) ? null : filtro.TermoBusca.Trim());

        var limite = RetiradaEstoqueExportacaoLimites.MaximoLinhas;
        var consulta = await _retiradaRepository.ListarHistoricoParaExportacaoAsync(
            consultaFiltros,
            ordemDataAscendente,
            limite,
            cancellationToken);

        if (consulta.TotalRegistrosIntersecao > limite)
        {
            throw new ExportacaoRetiradasLimiteExcedidoException(consulta.TotalRegistrosIntersecao, limite);
        }

        var contexto = new RetiradaEstoqueExportacaoContextoDTO
        {
            DataInicioUtcAplicada = janela.InicioUtcInclusive,
            DataFimUtcInclusiveAplicada = janela.FimUtcInclusive,
            TotalRegistros = consulta.TotalRegistrosIntersecao,
            SomaQuantidade = consulta.SomaQuantidadeIntersecao,
            TermoBusca = consultaFiltros.TermoBusca,
            FiltroRetirante = idRetiranteLista?.ToString(),
            FiltroRecebedor = idRecebedorLista?.ToString(),
        };

        return (consulta.Linhas, contexto);
    }
}
