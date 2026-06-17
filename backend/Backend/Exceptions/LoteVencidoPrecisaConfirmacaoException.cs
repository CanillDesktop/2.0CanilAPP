namespace Backend.Exceptions;

/// <summary>
/// Sinaliza que o lote selecionado está vencido e a retirada exige confirmação explícita
/// do usuário antes de prosseguir. Carrega a data de validade para exibição.
/// </summary>
public class LoteVencidoPrecisaConfirmacaoException : Exception
{
    public DateTime DataValidade { get; }

    public LoteVencidoPrecisaConfirmacaoException(DateTime dataValidade)
        : base($"O lote está vencido (validade em {dataValidade:dd/MM/yyyy}). Confirme se deseja realmente realizar a retirada.")
    {
        DataValidade = dataValidade;
    }
}
