using System.Globalization;
using Backend.DTOs.Estoque;
using ClosedXML.Excel;

namespace Backend.Exportacao;

/// <summary>
/// Planilha .xlsx com entradas e saídas de transferência entre unidades.
/// Abas por direção (Secretaria→Canil e Canil→Secretaria) somente quando houver dados.
/// </summary>
public static class TransferenciaEstoqueExcelExportador
{
    private static readonly TimeZoneInfo FusoOperacional = ResolverFusoBrasil();

    private static readonly XLColor CorCabecalhoFundo = XLColor.FromHtml("#1F4E79");
    private static readonly XLColor CorCabecalhoFonte = XLColor.White;
    private static readonly XLColor CorZebra = XLColor.FromHtml("#F2F6FA");
    private static readonly XLColor CorBorda = XLColor.FromHtml("#D0D7DE");
    private static readonly XLColor CorSaida = XLColor.FromHtml("#FCE4D6");
    private static readonly XLColor CorEntrada = XLColor.FromHtml("#E2EFDA");

    private static readonly (string Rotulo, int LarguraMin)[] Colunas =
    [
        ("ID transf.", 10),
        ("Data/Hora", 18),
        ("Tipo", 10),
        ("Unidade (movimento)", 18),
        ("Origem", 14),
        ("Destino", 14),
        ("Direção", 20),
        ("Código", 14),
        ("Item", 28),
        ("Lote", 14),
        ("Quantidade", 12),
        ("Status", 12),
        ("Quem realizou", 22),
        ("Quem recebe (informado)", 24),
        ("Usuário sistema (envio)", 22),
        ("Usuário sistema (receb.)", 22),
        ("Observação", 28),
    ];

    public const string DirecaoSecParaCanil = "Secretaria → Canil";
    public const string DirecaoCanilParaSec = "Canil → Secretaria";

    public static ArquivoExportadoDTO Gerar(
        IReadOnlyList<TransferenciaMovimentoExportacaoDTO> movimentos,
        TransferenciaEstoqueExportacaoContextoDTO contexto)
    {
        using var workbook = new XLWorkbook();

        AdicionarPlanilha(workbook, "Todas", movimentos, contexto, incluirCabecalhoContexto: true);

        if (contexto.IncluiSecParaCanil)
        {
            var secCanil = movimentos.Where(m => m.Direcao == DirecaoSecParaCanil).ToList();
            AdicionarPlanilha(workbook, "Sec para Canil", secCanil, contexto, incluirCabecalhoContexto: false);
        }

        if (contexto.IncluiCanilParaSec)
        {
            var canilSec = movimentos.Where(m => m.Direcao == DirecaoCanilParaSec).ToList();
            AdicionarPlanilha(workbook, "Canil para Sec", canilSec, contexto, incluirCabecalhoContexto: false);
        }

        AdicionarPlanilhaResumo(workbook, movimentos, contexto);

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);

        var nome = $"transferencias-estoque-{contexto.GeradoEmUtc:yyyyMMdd-HHmm}.xlsx";
        return new ArquivoExportadoDTO
        {
            Conteudo = stream.ToArray(),
            NomeArquivo = nome,
            ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        };
    }

    private static void AdicionarPlanilha(
        XLWorkbook workbook,
        string nomeAba,
        IReadOnlyList<TransferenciaMovimentoExportacaoDTO> movimentos,
        TransferenciaEstoqueExportacaoContextoDTO contexto,
        bool incluirCabecalhoContexto)
    {
        var ws = workbook.Worksheets.Add(nomeAba);
        var ultimaLinha = PreencherDetalhe(ws, movimentos, contexto, incluirCabecalhoContexto);
        AplicarEstiloTabela(ws, ultimaLinha, incluirCabecalhoContexto);
        ConfigurarImpressao(ws, incluirCabecalhoContexto ? 4 : 1);
    }

    private static int PreencherDetalhe(
        IXLWorksheet ws,
        IReadOnlyList<TransferenciaMovimentoExportacaoDTO> movimentos,
        TransferenciaEstoqueExportacaoContextoDTO contexto,
        bool incluirCabecalhoContexto)
    {
        var linhaCabecalho = 1;

        if (incluirCabecalhoContexto)
        {
            ws.Cell(1, 1).Value = "Transferências entre unidades — entradas e saídas — CanilApp";
            ws.Range(1, 1, 1, Colunas.Length).Merge();
            ws.Cell(1, 1).Style.Font.SetBold(true).Font.SetFontSize(14);

            ws.Cell(2, 1).Value =
                $"Gerado em: {FormatarDataHoraLocal(contexto.GeradoEmUtc)} | " +
                $"Transferências: {contexto.TotalTransferencias:N0} | " +
                $"Movimentos: {contexto.TotalMovimentos:N0} | " +
                $"Soma saídas: {contexto.SomaQuantidadeSaidas:N0} | " +
                $"Soma entradas: {contexto.SomaQuantidadeEntradas:N0}";
            ws.Range(2, 1, 2, Colunas.Length).Merge();
            ws.Cell(2, 1).Style.Font.SetItalic(true).Font.SetFontColor(XLColor.FromHtml("#444444"));

            linhaCabecalho = 4;
        }

        for (var c = 0; c < Colunas.Length; c++)
            ws.Cell(linhaCabecalho, c + 1).Value = Colunas[c].Rotulo;

        var linhaAtual = linhaCabecalho + 1;
        foreach (var item in movimentos)
        {
            var zebra = (linhaAtual - linhaCabecalho) % 2 == 0;
            PreencherLinha(ws, linhaAtual, item, zebra);
            linhaAtual++;
        }

        if (movimentos.Count == 0)
        {
            ws.Cell(linhaAtual, 1).Value = "Nenhum movimento de transferência encontrado.";
            ws.Range(linhaAtual, 1, linhaAtual, Colunas.Length).Merge();
            return linhaAtual;
        }

        return linhaAtual - 1;
    }

    private static void PreencherLinha(
        IXLWorksheet ws,
        int linha,
        TransferenciaMovimentoExportacaoDTO item,
        bool zebra)
    {
        var local = TimeZoneInfo.ConvertTimeFromUtc(
            DateTime.SpecifyKind(item.DataHora, DateTimeKind.Utc),
            FusoOperacional);

        ws.Cell(linha, 1).Value = item.IdTransferencia;
        ws.Cell(linha, 2).Value = local;
        ws.Cell(linha, 2).Style.DateFormat.Format = "dd/MM/yyyy HH:mm";
        ws.Cell(linha, 3).Value = item.TipoMovimento;
        ws.Cell(linha, 4).Value = TextoOuVazio(item.UnidadeMovimento);
        ws.Cell(linha, 5).Value = TextoOuVazio(item.UnidadeOrigemNome);
        ws.Cell(linha, 6).Value = TextoOuVazio(item.UnidadeDestinoNome);
        ws.Cell(linha, 7).Value = TextoOuVazio(item.Direcao);
        ws.Cell(linha, 8).Value = TextoOuVazio(item.Codigo);
        ws.Cell(linha, 9).Value = TextoOuVazio(item.NomeItem);
        ws.Cell(linha, 10).Value = TextoOuVazio(item.Lote);
        ws.Cell(linha, 11).Value = item.Quantidade;
        ws.Cell(linha, 12).Value = TextoOuVazio(item.Status);
        ws.Cell(linha, 13).Value = TextoOuVazio(item.ResponsavelEnvio);
        ws.Cell(linha, 14).Value = TextoOuVazio(item.ResponsavelRecebimento);
        ws.Cell(linha, 15).Value = TextoOuVazio(item.UsuarioSistemaEnvio);
        ws.Cell(linha, 16).Value = TextoOuVazio(item.UsuarioSistemaRecebimento);
        ws.Cell(linha, 17).Value = TextoOuVazio(item.Observacao);

        var faixa = ws.Range(linha, 1, linha, Colunas.Length);
        if (zebra)
            faixa.Style.Fill.SetBackgroundColor(CorZebra);

        var tipo = item.TipoMovimento.Trim().ToUpperInvariant();
        if (tipo == "SAÍDA" || tipo == "SAIDA")
            ws.Cell(linha, 3).Style.Fill.SetBackgroundColor(CorSaida);
        else if (tipo == "ENTRADA")
            ws.Cell(linha, 3).Style.Fill.SetBackgroundColor(CorEntrada);

        ws.Cell(linha, 1).Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);
        ws.Cell(linha, 3).Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);
        ws.Cell(linha, 3).Style.Font.SetBold(true);
        ws.Cell(linha, 11).Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);
        ws.Cell(linha, 11).Style.NumberFormat.Format = "#,##0";
        ws.Cell(linha, 17).Style.Alignment.SetWrapText(true);
    }

    private static void AplicarEstiloTabela(IXLWorksheet ws, int ultimaLinhaDados, bool incluirCabecalhoContexto)
    {
        var linhaCabecalho = incluirCabecalhoContexto ? 4 : 1;
        if (ultimaLinhaDados < linhaCabecalho)
            return;

        var faixaTabela = ws.Range(linhaCabecalho, 1, ultimaLinhaDados, Colunas.Length);
        var nomeTabela = $"Tbl{ws.Name.Replace(" ", "", StringComparison.Ordinal).Replace("→", "", StringComparison.Ordinal)}";
        var tabela = faixaTabela.CreateTable(nomeTabela);
        tabela.Theme = XLTableTheme.TableStyleMedium2;
        tabela.ShowAutoFilter = true;

        var cabecalho = ws.Range(linhaCabecalho, 1, linhaCabecalho, Colunas.Length);
        cabecalho.Style.Fill.SetBackgroundColor(CorCabecalhoFundo);
        cabecalho.Style.Font.SetBold(true);
        cabecalho.Style.Font.SetFontColor(CorCabecalhoFonte);
        cabecalho.Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);

        faixaTabela.Style.Border.SetOutsideBorder(XLBorderStyleValues.Thin);
        faixaTabela.Style.Border.SetInsideBorder(XLBorderStyleValues.Thin);
        faixaTabela.Style.Border.OutsideBorderColor = CorBorda;
        faixaTabela.Style.Border.InsideBorderColor = CorBorda;

        ws.SheetView.FreezeRows(linhaCabecalho);

        for (var c = 0; c < Colunas.Length; c++)
        {
            var coluna = ws.Column(c + 1);
            coluna.Width = Colunas[c].LarguraMin;
            coluna.AdjustToContents(linhaCabecalho, Math.Min(ultimaLinhaDados, linhaCabecalho + 200));
            if (coluna.Width < Colunas[c].LarguraMin)
                coluna.Width = Colunas[c].LarguraMin;
            if (coluna.Width > 48)
                coluna.Width = 48;
        }
    }

    private static void AdicionarPlanilhaResumo(
        XLWorkbook workbook,
        IReadOnlyList<TransferenciaMovimentoExportacaoDTO> movimentos,
        TransferenciaEstoqueExportacaoContextoDTO contexto)
    {
        var ws = workbook.Worksheets.Add("Resumo");
        ws.Cell(1, 1).Value = "Resumo — Transferências entre unidades";
        ws.Cell(1, 1).Style.Font.SetBold(true).Font.SetFontSize(14);

        ws.Cell(2, 1).Value = "Gerado em (UTC)";
        ws.Cell(2, 2).Value = contexto.GeradoEmUtc.ToString("dd/MM/yyyy HH:mm:ss", CultureInfo.GetCultureInfo("pt-BR"));

        ws.Cell(3, 1).Value = "Total de transferências";
        ws.Cell(3, 2).Value = contexto.TotalTransferencias;

        ws.Cell(4, 1).Value = "Total de movimentos (entrada + saída)";
        ws.Cell(4, 2).Value = contexto.TotalMovimentos;

        ws.Cell(5, 1).Value = "Soma quantidades (saídas)";
        ws.Cell(5, 2).Value = contexto.SomaQuantidadeSaidas;
        ws.Cell(5, 2).Style.NumberFormat.Format = "#,##0";

        ws.Cell(6, 1).Value = "Soma quantidades (entradas)";
        ws.Cell(6, 2).Value = contexto.SomaQuantidadeEntradas;
        ws.Cell(6, 2).Style.NumberFormat.Format = "#,##0";

        var linha = 8;
        linha = EscreverTabelaAgrupada(ws, linha, "Movimentos por direção", movimentos
            .GroupBy(m => TextoOuVazio(m.Direcao))
            .Select(g => (g.Key, g.Count()))
            .OrderByDescending(x => x.Item2));

        linha = EscreverTabelaAgrupada(ws, linha + 1, "Movimentos por tipo", movimentos
            .GroupBy(m => TextoOuVazio(m.TipoMovimento))
            .Select(g => (g.Key, g.Count()))
            .OrderByDescending(x => x.Item2));

        EscreverTabelaAgrupada(ws, linha + 1, "Movimentos por status", movimentos
            .GroupBy(m => TextoOuVazio(m.Status))
            .Select(g => (g.Key, g.Count()))
            .OrderByDescending(x => x.Item2));

        ws.Columns(1, 2).AdjustToContents();
        ws.Column(1).Width = Math.Max(ws.Column(1).Width, 32);
        ConfigurarImpressao(ws, 0);
    }

    private static int EscreverTabelaAgrupada(
        IXLWorksheet ws,
        int linhaInicio,
        string titulo,
        IEnumerable<(string Chave, int Total)> grupos)
    {
        ws.Cell(linhaInicio, 1).Value = titulo;
        ws.Cell(linhaInicio, 1).Style.Font.SetBold(true).Font.SetFontColor(CorCabecalhoFundo);

        var linha = linhaInicio + 1;
        ws.Cell(linha, 1).Value = "Descrição";
        ws.Cell(linha, 2).Value = "Quantidade";
        ws.Range(linha, 1, linha, 2).Style.Font.SetBold(true);
        ws.Range(linha, 1, linha, 2).Style.Fill.SetBackgroundColor(XLColor.FromHtml("#E8EEF4"));

        linha++;
        var lista = grupos.ToList();
        if (lista.Count == 0)
        {
            ws.Cell(linha, 1).Value = "(sem dados)";
            return linha;
        }

        foreach (var (chave, total) in lista)
        {
            ws.Cell(linha, 1).Value = chave;
            ws.Cell(linha, 2).Value = total;
            linha++;
        }

        var faixa = ws.Range(linhaInicio + 1, 1, linha - 1, 2);
        faixa.Style.Border.SetOutsideBorder(XLBorderStyleValues.Thin);
        faixa.Style.Border.SetInsideBorder(XLBorderStyleValues.Thin);
        faixa.Style.Border.OutsideBorderColor = CorBorda;
        faixa.Style.Border.InsideBorderColor = CorBorda;

        return linha;
    }

    private static void ConfigurarImpressao(IXLWorksheet ws, int linhaParaRepetir)
    {
        ws.PageSetup.PageOrientation = XLPageOrientation.Landscape;
        ws.PageSetup.PaperSize = XLPaperSize.A4Paper;
        ws.PageSetup.FitToPages(1, 0);
        ws.PageSetup.Margins.Top = 0.5;
        ws.PageSetup.Margins.Bottom = 0.5;
        ws.PageSetup.Margins.Left = 0.4;
        ws.PageSetup.Margins.Right = 0.4;
        if (linhaParaRepetir > 0 && ws.LastRowUsed()?.RowNumber() >= linhaParaRepetir)
            ws.PageSetup.SetRowsToRepeatAtTop(linhaParaRepetir, linhaParaRepetir);
    }

    private static string FormatarDataHoraLocal(DateTime utc) =>
        TimeZoneInfo.ConvertTimeFromUtc(DateTime.SpecifyKind(utc, DateTimeKind.Utc), FusoOperacional)
            .ToString("dd/MM/yyyy HH:mm", CultureInfo.GetCultureInfo("pt-BR"));

    private static string TextoOuVazio(string? valor) =>
        string.IsNullOrWhiteSpace(valor) ? "—" : valor.Trim();

    private static TimeZoneInfo ResolverFusoBrasil()
    {
        foreach (var id in new[] { "America/Sao_Paulo", "E. South America Standard Time" })
        {
            try
            {
                return TimeZoneInfo.FindSystemTimeZoneById(id);
            }
            catch (TimeZoneNotFoundException)
            {
            }
            catch (InvalidTimeZoneException)
            {
            }
        }

        return TimeZoneInfo.Utc;
    }
}
