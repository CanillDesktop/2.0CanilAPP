using Microsoft.AspNetCore.Http;

namespace Backend.Exceptions
{
    /// <summary>
    /// Operação recusada por conflito com o estado atual do sistema
    /// (ex.: tentar inativar a própria conta ou remover o último administrador ativo).
    /// </summary>
    public class ConflitoDeNegocioException : ExcecaoDeNegocio
    {
        public override int StatusCode => StatusCodes.Status409Conflict;
        public override string Titulo => "Operação não permitida";

        public ConflitoDeNegocioException(string message) : base(message) { }

        public ConflitoDeNegocioException(string message, Exception inner) : base(message, inner) { }
    }
}
