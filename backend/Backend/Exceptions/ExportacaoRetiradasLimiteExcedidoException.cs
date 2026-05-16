namespace Backend.Exceptions;

public sealed class ExportacaoRetiradasLimiteExcedidoException : Exception
{
    public ExportacaoRetiradasLimiteExcedidoException(int totalEncontrado, int limite)
        : base(
            $"O recorte selecionado contém {totalEncontrado:N0} retiradas, acima do limite de exportação ({limite:N0}). " +
            "Refine o período ou os filtros e tente novamente.")
    {
        TotalEncontrado = totalEncontrado;
        Limite = limite;
    }

    public int TotalEncontrado { get; }

    public int Limite { get; }
}
