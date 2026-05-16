namespace Backend.Exportacao;

public static class RetiradaEstoqueExportacaoLimites
{
    /// <summary>Limite de linhas por exportação para manter memória e tempo de resposta aceitáveis.</summary>
    public const int MaximoLinhas = 50_000;
}
