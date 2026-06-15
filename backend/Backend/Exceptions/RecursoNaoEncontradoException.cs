using Microsoft.AspNetCore.Http;

namespace Backend.Exceptions
{
    /// <summary>Recurso solicitado não existe (ou foi removido). Convertido em HTTP 404.</summary>
    public class RecursoNaoEncontradoException : ExcecaoDeNegocio
    {
        public override int StatusCode => StatusCodes.Status404NotFound;
        public override string Titulo => "Recurso não encontrado";

        public RecursoNaoEncontradoException(string message) : base(message) { }

        public RecursoNaoEncontradoException(string message, Exception inner) : base(message, inner) { }
    }
}
