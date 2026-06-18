namespace Backend.Filtro.Helpers;

/// <summary>
/// Normalização de termos de busca traduzível para SQL via EF Core (ToLower + Contains).
/// </summary>
internal static class TermoBuscaQueryable
{
    public static bool TryNormalizar(string? termo, out string normalizado)
    {
        if (string.IsNullOrWhiteSpace(termo))
        {
            normalizado = string.Empty;
            return false;
        }

        normalizado = termo.Trim().ToLowerInvariant();
        return true;
    }
}
