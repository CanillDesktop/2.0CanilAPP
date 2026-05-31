using System.Globalization;
using System.Text;
using Backend.DTOs.Estoque;

namespace Backend.Exportacao;

/// <summary>CSV UTF-8 com BOM para integrações externas (exportação secundária).</summary>
public static class RetiradaEstoqueHistoricoCsvExportador
{
    private static readonly string[] Cabecalhos =
    [
        "id",
        "data_hora",
        "codigo",
        "nome_produto",
        "lote",
        "quantidade",
        "retirante_exibicao",
        "id_usuario_retirante",
        "recebedor_exibicao",
        "id_usuario_recebedor",
        "observacao",
        "status",
    ];
    private static TimeZoneInfo FusoOperacional => _fusoOperacional ??= ResolverFusoBrasil();
    private static TimeZoneInfo? _fusoOperacional;

    public static ArquivoExportadoDTO Gerar(IReadOnlyList<RetiradaEstoqueHistoricoItemDTO> itens, RetiradaEstoqueExportacaoContextoDTO contexto)
    {
        var sb = new StringBuilder();
        sb.Append('\uFEFF'); 
        sb.AppendLine(string.Join(';', Cabecalhos));

        foreach (var item in itens)
        {
            var utc = DateTime.SpecifyKind(item.DataHoraRetirada, DateTimeKind.Utc);
            var local = TimeZoneInfo.ConvertTimeFromUtc(utc, FusoOperacional);

            sb.AppendLine(string.Join(';', new[]
            {
                item.Id.ToString(CultureInfo.InvariantCulture),
               Cel("\u200B" + local.ToString("dd/MM/yyyy HH:mm", CultureInfo.GetCultureInfo("pt-BR"))),
                Cel(item.Codigo),
                Cel(item.NomeProduto),
                Cel(item.Lote),
                item.Quantidade.ToString(CultureInfo.InvariantCulture),
                Cel(item.UsuarioRetiranteExibicao),
                item.IdUsuarioRetirante?.ToString(CultureInfo.InvariantCulture) ?? string.Empty,
                Cel(item.UsuarioRecebedorExibicao),
                item.IdUsuarioRecebedor?.ToString(CultureInfo.InvariantCulture) ?? string.Empty,
                Cel(item.Observacao ?? string.Empty),
                Cel(item.Status),
            }));
        }

        var nome = $"retiradas-estoque-{contexto.DataInicioUtcAplicada:yyyyMMdd}-{contexto.DataFimUtcInclusiveAplicada:yyyyMMdd}.csv";
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
        var fusosParaTentar = new[] { "America/Sao_Paulo", "E. South America Standard Time" };

        foreach (var id in fusosParaTentar)
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