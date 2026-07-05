using System.Globalization;
using System.Text;
using Backend.DTOs.Estoque;

namespace Backend.Exportacao;

/// <summary>CSV UTF-8 com BOM: entradas e saídas de transferência entre unidades.</summary>
public static class TransferenciaEstoqueCsvExportador
{
    private static readonly string[] Cabecalhos =
    [
        "id_transferencia",
        "data_hora",
        "tipo_movimento",
        "unidade_movimento",
        "id_unidade_origem",
        "unidade_origem",
        "id_unidade_destino",
        "unidade_destino",
        "direcao",
        "codigo",
        "nome_item",
        "lote",
        "quantidade",
        "status",
        "responsavel_envio",
        "responsavel_recebimento",
        "usuario_sistema_envio",
        "usuario_sistema_recebimento",
        "observacao",
    ];

    private static TimeZoneInfo FusoOperacional => _fusoOperacional ??= ResolverFusoBrasil();
    private static TimeZoneInfo? _fusoOperacional;

    public static ArquivoExportadoDTO Gerar(
        IReadOnlyList<TransferenciaMovimentoExportacaoDTO> movimentos,
        TransferenciaEstoqueExportacaoContextoDTO contexto)
    {
        var sb = new StringBuilder();
        sb.Append('\uFEFF');
        sb.AppendLine(string.Join(';', Cabecalhos));

        var cultura = CultureInfo.GetCultureInfo("pt-BR");
        foreach (var item in movimentos)
        {
            var utc = DateTime.SpecifyKind(item.DataHora, DateTimeKind.Utc);
            var local = TimeZoneInfo.ConvertTimeFromUtc(utc, FusoOperacional);

            sb.AppendLine(string.Join(';', new[]
            {
                item.IdTransferencia.ToString(CultureInfo.InvariantCulture),
                Cel("\u200B" + local.ToString("dd/MM/yyyy HH:mm", cultura)),
                Cel(item.TipoMovimento),
                Cel(item.UnidadeMovimento),
                item.IdUnidadeOrigem.ToString(CultureInfo.InvariantCulture),
                Cel(item.UnidadeOrigemNome),
                item.IdUnidadeDestino?.ToString(CultureInfo.InvariantCulture) ?? string.Empty,
                Cel(item.UnidadeDestinoNome),
                Cel(item.Direcao),
                Cel(item.Codigo),
                Cel(item.NomeItem),
                Cel(item.Lote),
                item.Quantidade.ToString(CultureInfo.InvariantCulture),
                Cel(item.Status),
                Cel(item.ResponsavelEnvio),
                Cel(item.ResponsavelRecebimento ?? string.Empty),
                Cel(item.UsuarioSistemaEnvio),
                Cel(item.UsuarioSistemaRecebimento ?? string.Empty),
                Cel(item.Observacao ?? string.Empty),
            }));
        }

        var nome = $"transferencias-estoque-{contexto.GeradoEmUtc:yyyyMMdd-HHmm}.csv";
        return new ArquivoExportadoDTO
        {
            Conteudo = Encoding.UTF8.GetBytes(sb.ToString()),
            NomeArquivo = nome,
            ContentType = "text/csv; charset=utf-8",
        };
    }

    private static string Cel(string valor)
    {
        var s = valor ?? string.Empty;
        if (s.Contains(';') || s.Contains('"') || s.Contains('\r') || s.Contains('\n'))
            return $"\"{s.Replace("\"", "\"\"", StringComparison.Ordinal)}\"";
        return s;
    }

    private static TimeZoneInfo ResolverFusoBrasil()
    {
        foreach (var id in new[] { "America/Sao_Paulo", "E. South America Standard Time" })
        {
            try
            {
                return TimeZoneInfo.FindSystemTimeZoneById(id);
            }
            catch (Exception ex) when (ex is TimeZoneNotFoundException or InvalidTimeZoneException)
            {
            }
        }

        return TimeZoneInfo.Utc;
    }
}
