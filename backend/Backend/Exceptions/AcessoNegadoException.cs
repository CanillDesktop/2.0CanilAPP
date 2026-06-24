using Microsoft.AspNetCore.Http;

namespace Backend.Exceptions;

/// <summary>
/// Credenciais válidas, porém acesso recusado (conta inativa, excluída ou sem permissão).
/// </summary>
public class AcessoNegadoException : ExcecaoDeNegocio
{
    public override int StatusCode => StatusCodes.Status403Forbidden;
    public override string Titulo => "Acesso negado";

    public AcessoNegadoException(string message) : base(message) { }
}
