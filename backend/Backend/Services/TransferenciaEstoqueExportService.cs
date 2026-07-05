using Backend.DTOs.Estoque;
using Backend.Exportacao;
using Backend.Models.Estoque;
using Backend.Services.Interfaces;
using Microsoft.Extensions.Logging;

namespace Backend.Services;

public sealed class TransferenciaEstoqueExportService : ITransferenciaEstoqueExportService
{
    private readonly ITransferenciaEstoqueService _transferenciaService;
    private readonly ILogger<TransferenciaEstoqueExportService> _logger;

    public TransferenciaEstoqueExportService(
        ITransferenciaEstoqueService transferenciaService,
        ILogger<TransferenciaEstoqueExportService> logger)
    {
        _transferenciaService = transferenciaService;
        _logger = logger;
    }

    public Task<ArquivoExportadoDTO> ExportarXlsxAsync(CancellationToken cancellationToken = default) =>
        ExportarAsync(TransferenciaEstoqueExcelExportador.Gerar, cancellationToken);

    public Task<ArquivoExportadoDTO> ExportarCsvAsync(CancellationToken cancellationToken = default) =>
        ExportarAsync(TransferenciaEstoqueCsvExportador.Gerar, cancellationToken);

    private async Task<ArquivoExportadoDTO> ExportarAsync(
        Func<IReadOnlyList<TransferenciaMovimentoExportacaoDTO>, TransferenciaEstoqueExportacaoContextoDTO, ArquivoExportadoDTO> gerarArquivo,
        CancellationToken cancellationToken)
    {
        try
        {
            var (movimentos, contexto) = await CarregarDadosAsync(cancellationToken);
            return gerarArquivo(movimentos, contexto);
        }
        catch (InvalidOperationException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Falha ao gerar exportação de transferências de estoque.");
            throw new InvalidOperationException(
                "Não foi possível gerar o arquivo de exportação. Tente novamente em instantes.",
                ex);
        }
    }

    private async Task<(IReadOnlyList<TransferenciaMovimentoExportacaoDTO> Movimentos, TransferenciaEstoqueExportacaoContextoDTO Contexto)>
        CarregarDadosAsync(CancellationToken cancellationToken)
    {
        var transferencias = await _transferenciaService.ListarAsync(cancellationToken);
        var movimentos = ExpandirMovimentos(transferencias);

        if (movimentos.Count > RetiradaEstoqueExportacaoLimites.MaximoLinhas)
        {
            throw new InvalidOperationException(
                $"Há mais de {RetiradaEstoqueExportacaoLimites.MaximoLinhas:N0} movimentos para exportar. Contate o suporte.");
        }

        var contexto = new TransferenciaEstoqueExportacaoContextoDTO
        {
            GeradoEmUtc = DateTime.UtcNow,
            TotalMovimentos = movimentos.Count,
            TotalTransferencias = transferencias.Count,
            SomaQuantidadeSaidas = movimentos
                .Where(m => m.TipoMovimento.Equals("Saída", StringComparison.OrdinalIgnoreCase))
                .Sum(m => m.Quantidade),
            SomaQuantidadeEntradas = movimentos
                .Where(m => m.TipoMovimento.Equals("Entrada", StringComparison.OrdinalIgnoreCase))
                .Sum(m => m.Quantidade),
            IncluiSecParaCanil = movimentos.Any(m => m.Direcao == TransferenciaEstoqueExcelExportador.DirecaoSecParaCanil),
            IncluiCanilParaSec = movimentos.Any(m => m.Direcao == TransferenciaEstoqueExcelExportador.DirecaoCanilParaSec),
        };

        return (movimentos, contexto);
    }

    internal static List<TransferenciaMovimentoExportacaoDTO> ExpandirMovimentos(
        IReadOnlyList<TransferenciaEstoqueLeituraDTO> transferencias)
    {
        var lista = new List<TransferenciaMovimentoExportacaoDTO>();

        foreach (var t in transferencias.OrderByDescending(x => x.DataTransferencia).ThenByDescending(x => x.Id))
        {
            var status = (t.Status ?? string.Empty).Trim().ToUpperInvariant();
            if (status is "RASCUNHO" or "CANCELADA" or "CANCELADO")
                continue;

            var direcao = ResolverDirecao(t.IdUnidadeOrigem, t.IdUnidadeDestino, t.UnidadeOrigemNome, t.UnidadeDestinoNome);
            var perspectiva = (t.TipoMovimento ?? string.Empty).Trim();
            var ehSaida = perspectiva.Equals("Saida", StringComparison.OrdinalIgnoreCase)
                || perspectiva.Equals("Saída", StringComparison.OrdinalIgnoreCase);
            var ehEntrada = perspectiva.Equals("Entrada", StringComparison.OrdinalIgnoreCase);

            // Sem perspectiva (legado): exporta saída e, se recebida, entrada.
            // Com perspectiva da unidade ativa: só o movimento dessa unidade.
            foreach (var item in t.Itens)
            {
                if (ehSaida || string.IsNullOrEmpty(perspectiva))
                {
                    lista.Add(CriarLinha(t, item, direcao, tipoMovimento: "Saída", unidadeMovimento: t.UnidadeOrigemNome));
                }

                if (ehEntrada || (string.IsNullOrEmpty(perspectiva) && status is "RECEBIDA" or "RECEBIDO" && t.IdUnidadeDestino.HasValue))
                {
                    lista.Add(CriarLinha(t, item, direcao, tipoMovimento: "Entrada", unidadeMovimento: t.UnidadeDestinoNome));
                }
            }
        }

        return lista;
    }

    private static TransferenciaMovimentoExportacaoDTO CriarLinha(
        TransferenciaEstoqueLeituraDTO t,
        TransferenciaEstoqueItemLeituraDTO item,
        string direcao,
        string tipoMovimento,
        string unidadeMovimento) =>
        new()
        {
            IdTransferencia = t.Id,
            DataHora = t.DataTransferencia,
            TipoMovimento = tipoMovimento,
            UnidadeMovimento = unidadeMovimento,
            IdUnidadeOrigem = t.IdUnidadeOrigem,
            UnidadeOrigemNome = t.UnidadeOrigemNome,
            IdUnidadeDestino = t.IdUnidadeDestino,
            UnidadeDestinoNome = string.IsNullOrWhiteSpace(t.UnidadeDestinoNome) ? "—" : t.UnidadeDestinoNome,
            Direcao = direcao,
            Codigo = item.Codigo,
            NomeItem = item.NomeItem,
            Lote = item.Lote,
            Quantidade = item.Quantidade,
            Status = t.Status ?? string.Empty,
            ResponsavelEnvio = t.ResponsavelEnvio?.Trim() ?? string.Empty,
            ResponsavelRecebimento = string.IsNullOrWhiteSpace(t.ResponsavelRecebimento) ? null : t.ResponsavelRecebimento.Trim(),
            UsuarioSistemaEnvio = t.UsuarioEnvio ?? string.Empty,
            UsuarioSistemaRecebimento = t.UsuarioRecebimento,
            Observacao = t.Observacao,
        };

    private static string ResolverDirecao(
        int idOrigem,
        int? idDestino,
        string nomeOrigem,
        string nomeDestino)
    {
        if (!idDestino.HasValue || idDestino.Value <= 0)
            return $"{nomeOrigem} → (sem destino)";

        if (idOrigem == UnidadeEstoqueIds.Secretaria && idDestino == UnidadeEstoqueIds.Canil)
            return TransferenciaEstoqueExcelExportador.DirecaoSecParaCanil;

        if (idOrigem == UnidadeEstoqueIds.Canil && idDestino == UnidadeEstoqueIds.Secretaria)
            return TransferenciaEstoqueExcelExportador.DirecaoCanilParaSec;

        return $"{nomeOrigem} → {nomeDestino}";
    }
}
