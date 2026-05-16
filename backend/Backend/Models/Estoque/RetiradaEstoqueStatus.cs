namespace Backend.Models.Estoque;

/// <summary>Valores fixos gravados na coluna Status (sem enum EF para SQLite/string simples).</summary>
public static class RetiradaEstoqueStatus
{
    /// <summary>Retirada concluída e persistida sem cancelamento posterior.</summary>
    public const string Confirmada = "CONFIRMADA";
}
