using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Backend.Context;

/// <summary>
/// Persiste DateTime em UTC e restaura Kind=Utc após leitura do SQLite (que retorna Unspecified).
/// </summary>
internal sealed class UtcDateTimeValueConverter : ValueConverter<DateTime, DateTime>
{
    public UtcDateTimeValueConverter()
        : base(
            v => CoagirUtc(v),
            v => DateTime.SpecifyKind(v, DateTimeKind.Utc))
    {
    }

    internal static DateTime CoagirUtc(DateTime value) =>
        value.Kind switch
        {
            DateTimeKind.Utc => value,
            DateTimeKind.Local => value.ToUniversalTime(),
            _ => DateTime.SpecifyKind(value, DateTimeKind.Utc),
        };
}

internal sealed class NullableUtcDateTimeValueConverter : ValueConverter<DateTime?, DateTime?>
{
    public NullableUtcDateTimeValueConverter()
        : base(
            v => v.HasValue ? UtcDateTimeValueConverter.CoagirUtc(v.Value) : v,
            v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v)
    {
    }
}
