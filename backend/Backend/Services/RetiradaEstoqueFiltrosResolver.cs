using Backend.DTOs.Estoque;

namespace Backend.Services;

internal static class RetiradaEstoqueFiltrosResolver
{
    private static readonly TimeZoneInfo FusoBrasilia = ObterFusoBrasilia();

    /// <exception cref="ArgumentException">Período inválido ou combinações ausentes.</exception>
    internal static RetiradasJanelaUtc ResolverPeriodoOuDatas(RetiradaEstoqueFiltroDTO filtro)
    {
        if (!string.IsNullOrWhiteSpace(filtro.PeriodoRapido))
        {
            var chave = filtro.PeriodoRapido.Trim().ToUpperInvariant();
            return chave switch
            {
                "HOJE" => ResolverHojeBrasilia(),
                "ULTIMOS_7_DIAS" => ResolverUltimosDiasBrasilia(7),
                "ULTIMOS_30_DIAS" => ResolverUltimosDiasBrasilia(30),
                _ => throw new ArgumentException(
                    $"Período rápido inválido. Use HOJE, ULTIMOS_7_DIAS ou ULTIMOS_30_DIAS. Recebido: {filtro.PeriodoRapido}.")
            };
        }

        if (filtro.DataInicioUtc == null || filtro.DataFimUtc == null)
        {
            throw new ArgumentException(
                "Informe PeriodoRapido ou ambos DataInicioUtc e DataFimUtc para consultar o histórico.");
        }

        var inicioUtc = CoagirUtc(filtro.DataInicioUtc.Value);
        var fimInclusiveUtc = CoagirUtc(filtro.DataFimUtc.Value);

        if (inicioUtc > fimInclusiveUtc)
            throw new ArgumentException("DataInicioUtc não pode ser maior que DataFimUtc.");

        return new RetiradasJanelaUtc(inicioUtc, fimInclusiveUtc);
    }

    private static RetiradasJanelaUtc ResolverHojeBrasilia()
    {
        var hojeBrasilia = DataCivilBrasiliaAtual();
        return JanelaDiaCivilBrasilia(hojeBrasilia, hojeBrasilia);
    }

    /// <param name="diasTotal">Por exemplo 7 inclui hoje mais seis dias anteriores no calendário de Brasília.</param>
    private static RetiradasJanelaUtc ResolverUltimosDiasBrasilia(int diasTotal)
    {
        if (diasTotal <= 0)
            throw new ArgumentOutOfRangeException(nameof(diasTotal));

        var fimBrasilia = DataCivilBrasiliaAtual();
        var inicioBrasilia = fimBrasilia.AddDays(-(diasTotal - 1));
        return JanelaDiaCivilBrasilia(inicioBrasilia, fimBrasilia);
    }

    private static DateTime DataCivilBrasiliaAtual()
    {
        var agoraBrasilia = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, FusoBrasilia);
        return agoraBrasilia.Date;
    }

    private static RetiradasJanelaUtc JanelaDiaCivilBrasilia(DateTime inicioBrasilia, DateTime fimBrasilia)
    {
        var inicioUtc = TimeZoneInfo.ConvertTimeToUtc(
            DateTime.SpecifyKind(inicioBrasilia, DateTimeKind.Unspecified),
            FusoBrasilia);
        var fimUtc = TimeZoneInfo.ConvertTimeToUtc(
            DateTime.SpecifyKind(fimBrasilia.AddDays(1).AddTicks(-1), DateTimeKind.Unspecified),
            FusoBrasilia);
        return new RetiradasJanelaUtc(inicioUtc, fimUtc);
    }

    private static DateTime CoagirUtc(DateTime value) =>
        value.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(value, DateTimeKind.Utc) : value.ToUniversalTime();

    private static TimeZoneInfo ObterFusoBrasilia()
    {
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById("America/Sao_Paulo");
        }
        catch (TimeZoneNotFoundException)
        {
            return TimeZoneInfo.FindSystemTimeZoneById("E. South America Standard Time");
        }
    }

    internal readonly record struct RetiradasJanelaUtc(DateTime InicioUtcInclusive, DateTime FimUtcInclusive);
}
