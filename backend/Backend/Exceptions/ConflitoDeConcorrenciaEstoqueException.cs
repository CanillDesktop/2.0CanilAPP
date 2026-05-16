namespace Backend.Exceptions;

/// <summary>Conflito de concorrência otimista na persistência de linhas de estoque.</summary>
public class ConflitoDeConcorrenciaEstoqueException : Exception
{
    public ConflitoDeConcorrenciaEstoqueException(string message)
        : base(message)
    {
    }

    public ConflitoDeConcorrenciaEstoqueException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}
