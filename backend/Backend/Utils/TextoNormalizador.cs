using System.Globalization;
using System.Text;

namespace Backend.Utils;

/// <summary>
/// Utilitários de normalização de texto usados na geração de códigos/lotes:
/// remove acentos, espaços e caracteres especiais e converte para maiúsculo.
/// </summary>
public static class TextoNormalizador
{
    /// <summary>
    /// Remove acentos, espaços e qualquer caractere não alfanumérico e converte para maiúsculo.
    /// </summary>
    public static string Normalizar(string? texto)
    {
        if (string.IsNullOrWhiteSpace(texto))
            return string.Empty;

        var semAcento = RemoverAcentos(texto);
        var sb = new StringBuilder(semAcento.Length);

        foreach (var c in semAcento)
        {
            if (char.IsLetterOrDigit(c))
                sb.Append(char.ToUpperInvariant(c));
        }

        return sb.ToString();
    }

    /// <summary>
    /// Retorna as <paramref name="quantidade"/> primeiras letras (A-Z/0-9) normalizadas.
    /// Caso o texto seja menor que o solicitado, completa com 'X' para manter tamanho fixo.
    /// </summary>
    public static string PrimeirasLetras(string? texto, int quantidade)
    {
        var normalizado = Normalizar(texto);

        if (normalizado.Length >= quantidade)
            return normalizado[..quantidade];

        return normalizado.PadRight(quantidade, 'X');
    }

    private static string RemoverAcentos(string texto)
    {
        var formaD = texto.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder(formaD.Length);

        foreach (var c in formaD)
        {
            var categoria = CharUnicodeInfo.GetUnicodeCategory(c);
            if (categoria != UnicodeCategory.NonSpacingMark)
                sb.Append(c);
        }

        return sb.ToString().Normalize(NormalizationForm.FormC);
    }
}
