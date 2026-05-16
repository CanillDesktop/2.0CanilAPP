namespace Backend.Repositories;

/// <summary>Janela e filtros já normalizados (UTC inclusive nas extremidades da janela).</summary>
public sealed record RetiradaEstoqueFiltroConsulta(
    DateTime IntervaloIniUtcInclusive,
    DateTime IntervaloFimUtcInclusive,
    int? IdUsuarioRetiranteLista,
    int? IdUsuarioRecebedorLista,
    string? TermoBusca);
