using Microsoft.Data.Sqlite;

namespace Backend.Data;

/// <summary>
/// Garante caminho absoluto para o arquivo SQLite (evita depender do diretório de trabalho do processo no Linux/systemd).
/// </summary>
public static class SqliteConnectionResolver
{
    /// <summary>
    /// Se <paramref name="connectionString"/> não tiver <c>Data Source</c> absoluto, combina com <paramref name="contentRoot"/>.
    /// Cria o diretório do arquivo se necessário.
    /// </summary>
    public static string Resolve(string connectionString, string contentRoot)
    {
        if (!connectionString.Contains('=', StringComparison.Ordinal))
            connectionString = $"Data Source={connectionString}";

        var builder = new SqliteConnectionStringBuilder(connectionString);
        var path = builder.DataSource;

        if (string.IsNullOrWhiteSpace(path))
            path = Path.Combine("data", "canilapp.db");

        if (string.Equals(path, ":memory:", StringComparison.OrdinalIgnoreCase)
            || path.StartsWith("file::memory:", StringComparison.OrdinalIgnoreCase))
            return builder.ConnectionString;

        if (!Path.IsPathRooted(path))
            path = Path.GetFullPath(Path.Combine(contentRoot, path.Replace('/', Path.DirectorySeparatorChar)));

        builder.DataSource = path;

        var dir = Path.GetDirectoryName(path);
        if (!string.IsNullOrEmpty(dir))
            Directory.CreateDirectory(dir);

        return builder.ConnectionString;
    }
}
