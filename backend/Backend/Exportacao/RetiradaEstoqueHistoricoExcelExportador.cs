using System.Globalization;
using Backend.DTOs.Estoque;
using ClosedXML.Excel;

namespace Backend.Exportacao;

/// <summary>Gera planilha .xlsx formatada para operação e gestão do histórico de retiradas.</summary>
public static class RetiradaEstoqueHistoricoExcelExportador
{
    private static readonly TimeZoneInfo FusoOperacional = ResolverFusoBrasil();

    private static readonly XLColor CorCabecalhoFundo = XLColor.FromHtml("#1F4E79");
    private static readonly XLColor CorCabecalhoFonte = XLColor.White;
    private static readonly XLColor CorZebra = XLColor.FromHtml("#F2F6FA");
    private static readonly XLColor CorBorda = XLColor.FromHtml("#D0D7DE");

    private static readonly (string Rotulo, int LarguraMin)[] ColunasDetalhe =
    [
        ("ID", 8),
        ("Data/Hora", 20),
        ("Código", 14),
        ("Produto", 28),
        ("Lote", 14),
        ("Quantidade", 12),
        ("Retirante", 24),
        ("Recebedor", 24),
        ("Observação", 32),
        ("Status", 14),
    ];

    public static ArquivoExportadoDTO Gerar( IReadOnlyList<RetiradaEstoqueHistoricoItemDTO> itens,RetiradaEstoqueExportacaoContextoDTO contexto)
    {
        using var workbook = new XLWorkbook();
        var planilhaDetalhe = workbook.Worksheets.Add("Retiradas");
        var ultimaLinhaDados = PreencherPlanilhaDetalhe(planilhaDetalhe, itens, contexto);
        AplicarEstiloTabelaDetalhe(planilhaDetalhe, ultimaLinhaDados);
        ConfigurarImpressao(planilhaDetalhe);

        var planilhaResumo = workbook.Worksheets.Add("Resumo");
        PreencherPlanilhaResumo(planilhaResumo, itens, contexto);
        ConfigurarImpressao(planilhaResumo);

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);

        var nome = $"retiradas-estoque-{contexto.DataInicioUtcAplicada:yyyyMMdd}-{contexto.DataFimUtcInclusiveAplicada:yyyyMMdd}.xlsx";
        return new ArquivoExportadoDTO
        {
            Conteudo = stream.ToArray(),
            NomeArquivo = nome,
            ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        };
    }

    public static string FormatarDataHoraLocal(DateTime dataHoraUtc)
    {
        var utc = DateTime.SpecifyKind(dataHoraUtc, DateTimeKind.Utc);
        var local = TimeZoneInfo.ConvertTimeFromUtc(utc, FusoOperacional);
        return local.ToString("dd/MM/yyyy HH:mm",CultureInfo.GetCultureInfo("pt-BR"));
    }

    private static int PreencherPlanilhaDetalhe(IXLWorksheet ws, IReadOnlyList<RetiradaEstoqueHistoricoItemDTO> itens, RetiradaEstoqueExportacaoContextoDTO contexto)
    {
        ws.Cell(1, 1).Value = "Histórico de retiradas de estoque — CanilApp";
        ws.Range(1, 1, 1, ColunasDetalhe.Length).Merge();
        ws.Cell(1, 1).Style
            .Font.SetBold(true)
            .Font.SetFontSize(14)
            .Alignment.SetHorizontal(XLAlignmentHorizontalValues.Left);

        ws.Cell(2, 1).Value =
            $"Período: {FormatarDataCurta(contexto.DataInicioUtcAplicada)} a {FormatarDataCurta(contexto.DataFimUtcInclusiveAplicada)} " +
            $"| Total: {contexto.TotalRegistros:N0} retirada(s) | Soma quantidades: {contexto.SomaQuantidade:N0}";
        ws.Range(2, 1, 2, ColunasDetalhe.Length).Merge();
        ws.Cell(2, 1).Style.Font.SetItalic(true).Font.SetFontColor(XLColor.FromHtml("#444444"));

        const int linhaCabecalho = 4;
        for (var c = 0; c < ColunasDetalhe.Length; c++)
            ws.Cell(linhaCabecalho, c + 1).Value = ColunasDetalhe[c].Rotulo;

        var linhaAtual = linhaCabecalho + 1;
        foreach (var item in itens)
        {
            var zebra = (linhaAtual - linhaCabecalho) % 2 == 0;
            PreencherLinhaDetalhe(ws, linhaAtual, item, zebra);
            linhaAtual++;
        }

        if (itens.Count == 0)
        {
            ws.Cell(linhaAtual, 1).Value = "Nenhuma retirada encontrada para os filtros aplicados.";
            ws.Range(linhaAtual, 1, linhaAtual, ColunasDetalhe.Length).Merge();
            return linhaAtual;
        }

        return linhaAtual - 1;
    }

    private static void PreencherLinhaDetalhe( IXLWorksheet ws,int linha, RetiradaEstoqueHistoricoItemDTO item,bool zebra)
    {
        var utc = DateTime.SpecifyKind(item.DataHoraRetirada, DateTimeKind.Utc);
        var local = TimeZoneInfo.ConvertTimeFromUtc(utc, FusoOperacional);

        ws.Cell(linha, 1).Value = item.Id;
        ws.Cell(linha, 2).Value = local;
        ws.Cell(linha, 2).Style.DateFormat.Format = "dd/MM/yyyy HH:mm";
        ws.Cell(linha, 3).Value = TextoOuVazio(item.Codigo);
        ws.Cell(linha, 4).Value = TextoOuVazio(item.NomeProduto);
        ws.Cell(linha, 5).Value = TextoOuVazio(item.Lote);
        ws.Cell(linha, 6).Value = item.Quantidade;
        ws.Cell(linha, 7).Value = TextoOuVazio(item.UsuarioRetiranteExibicao);
        ws.Cell(linha, 8).Value = TextoOuVazio(item.UsuarioRecebedorExibicao);
        ws.Cell(linha, 9).Value = TextoOuVazio(item.Observacao);
        ws.Cell(linha, 10).Value = TextoOuVazio(item.Status);

        var faixa = ws.Range(linha, 1, linha, ColunasDetalhe.Length);
        if (zebra)
            faixa.Style.Fill.SetBackgroundColor(CorZebra);

        ws.Cell(linha, 1).Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);
        ws.Cell(linha, 6).Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);
        ws.Cell(linha, 6).Style.NumberFormat.Format = "#,##0";
        ws.Cell(linha, 9).Style.Alignment.SetWrapText(true);
        ws.Cell(linha, 9).Style.Alignment.SetVertical(XLAlignmentVerticalValues.Top);

        AplicarEstiloStatus(ws.Cell(linha, 10), item.Status);
    }

    private static void AplicarEstiloTabelaDetalhe(IXLWorksheet ws, int ultimaLinhaDados)
    {
        const int linhaCabecalho = 4;
        if (ultimaLinhaDados < linhaCabecalho)
            return;

        var faixaTabela = ws.Range(linhaCabecalho, 1, ultimaLinhaDados, ColunasDetalhe.Length);
        var tabela = faixaTabela.CreateTable("TblRetiradas");
        tabela.Theme = XLTableTheme.TableStyleMedium2;
        tabela.ShowAutoFilter = true;

        var cabecalho = ws.Range(linhaCabecalho, 1, linhaCabecalho, ColunasDetalhe.Length);
        cabecalho.Style.Fill.SetBackgroundColor(CorCabecalhoFundo);
        cabecalho.Style.Font.SetBold(true);
        cabecalho.Style.Font.SetFontColor(CorCabecalhoFonte);
        cabecalho.Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);
        cabecalho.Style.Alignment.SetVertical(XLAlignmentVerticalValues.Center);

        faixaTabela.Style.Border.SetOutsideBorder(XLBorderStyleValues.Thin);
        faixaTabela.Style.Border.SetInsideBorder(XLBorderStyleValues.Thin);
        faixaTabela.Style.Border.OutsideBorderColor = CorBorda;
        faixaTabela.Style.Border.InsideBorderColor = CorBorda;

        ws.SheetView.FreezeRows(linhaCabecalho);

        for (var c = 0; c < ColunasDetalhe.Length; c++)
        {
            var coluna = ws.Column(c + 1);
            coluna.Width = ColunasDetalhe[c].LarguraMin;
            coluna.AdjustToContents(linhaCabecalho, Math.Min(ultimaLinhaDados, linhaCabecalho + 200));
            if (coluna.Width < ColunasDetalhe[c].LarguraMin)
                coluna.Width = ColunasDetalhe[c].LarguraMin;
            if (coluna.Width > 48)
                coluna.Width = 48;
        }
    }

    private static void PreencherPlanilhaResumo(IXLWorksheet ws,IReadOnlyList<RetiradaEstoqueHistoricoItemDTO> itens,RetiradaEstoqueExportacaoContextoDTO contexto)
    {
        ws.Cell(1, 1).Value = "Resumo — Histórico de retiradas";
        ws.Cell(1, 1).Style.Font.SetBold(true).Font.SetFontSize(14);

        ws.Cell(2, 1).Value = "Período (UTC aplicado no servidor)";
        ws.Cell(2, 2).Value =
            $"{contexto.DataInicioUtcAplicada:dd/MM/yyyy HH:mm:ss} — {contexto.DataFimUtcInclusiveAplicada:dd/MM/yyyy HH:mm:ss}";

        ws.Cell(3, 1).Value = "Total de retiradas";
        ws.Cell(3, 2).Value = contexto.TotalRegistros;

        ws.Cell(4, 1).Value = "Soma das quantidades";
        ws.Cell(4, 2).Value = contexto.SomaQuantidade;
        ws.Cell(4, 2).Style.NumberFormat.Format = "#,##0";

        if (!string.IsNullOrWhiteSpace(contexto.TermoBusca))
        {
            ws.Cell(5, 1).Value = "Termo de busca";
            ws.Cell(5, 2).Value = contexto.TermoBusca;
        }

        var linha = 7;
        linha = EscreverTabelaAgrupada(ws, linha, "Totais por status", itens
            .GroupBy(i => TextoOuVazio(i.Status))
            .Select(g => (g.Key, g.Count()))
            .OrderByDescending(x => x.Item2)
            .ThenBy(x => x.Item1));

        linha = EscreverTabelaAgrupada(ws, linha + 1, "Totais por retirante", itens
            .GroupBy(i => TextoOuVazio(i.UsuarioRetiranteExibicao))
            .Select(g => (g.Key, g.Count()))
            .OrderByDescending(x => x.Item2)
            .ThenBy(x => x.Item1));

        EscreverTabelaAgrupada(ws, linha + 1, "Totais por recebedor", itens
            .GroupBy(i => TextoOuVazio(i.UsuarioRecebedorExibicao))
            .Select(g => (g.Key, g.Count()))
            .OrderByDescending(x => x.Item2)
            .ThenBy(x => x.Item1));

        ws.Columns(1, 2).AdjustToContents();
        ws.Column(1).Width = Math.Max(ws.Column(1).Width, 28);
    }

    private static int EscreverTabelaAgrupada(IXLWorksheet ws,int linhaInicio,string titulo, IEnumerable<(string Chave, int Total)> grupos)
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

    private static void AplicarEstiloStatus(IXLCell celula, string? status)
    {
        var texto = TextoOuVazio(status);
        celula.Value = texto;
        celula.Style.Font.SetBold(true);
        celula.Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);

        var chave = texto.Trim().ToUpperInvariant();
        var (fundo, fonte) = chave switch
        {
            "CONFIRMADA" or "CONCLUIDA" or "CONCLUÍDA" or "APROVADA" or "APROVADO" =>
                (XLColor.FromHtml("#C6EFCE"), XLColor.FromHtml("#006100")),
            "PENDENTE" =>
                (XLColor.FromHtml("#FFEB9C"), XLColor.FromHtml("#9C6500")),
            "CANCELADA" or "CANCELADO" or "ERRO" or "FALHA" =>
                (XLColor.FromHtml("#FFC7CE"), XLColor.FromHtml("#9C0006")),
            "ESTORNADA" =>
                (XLColor.FromHtml("#E2DFED"), XLColor.FromHtml("#403151")),
            _ => (XLColor.FromHtml("#EDEDED"), XLColor.FromHtml("#333333")),
        };

        celula.Style.Fill.SetBackgroundColor(fundo);
        celula.Style.Font.SetFontColor(fonte);
    }

    private static void ConfigurarImpressao(IXLWorksheet ws, int linhaParaRepetir = 4)
    {
        ws.PageSetup.PageOrientation = XLPageOrientation.Landscape;
        ws.PageSetup.PaperSize = XLPaperSize.A4Paper;

        ws.PageSetup.FitToPages(1, 0);

        ws.PageSetup.Margins.Top = 0.5;
        ws.PageSetup.Margins.Bottom = 0.5;
        ws.PageSetup.Margins.Left = 0.4;
        ws.PageSetup.Margins.Right = 0.4;
        if (linhaParaRepetir > 0 && ws.LastRowUsed()?.RowNumber() >= linhaParaRepetir)
        {
            ws.PageSetup.SetRowsToRepeatAtTop(linhaParaRepetir, linhaParaRepetir);
        }
    }

    private static string FormatarDataCurta(DateTime utc) =>
        TimeZoneInfo.ConvertTimeFromUtc(DateTime.SpecifyKind(utc, DateTimeKind.Utc), FusoOperacional)
            .ToString("dd/MM/yyyy", CultureInfo.GetCultureInfo("pt-BR"));

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
                // tenta próximo id
            }
            catch (InvalidTimeZoneException)
            {
                // tenta próximo id
            }
        }

        return TimeZoneInfo.Utc;
    }
}
