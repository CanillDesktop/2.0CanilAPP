using Microsoft.AspNetCore.Http;

namespace Backend.Exceptions
{
    public class RegraDeNegocioInfringidaException : ExcecaoDeNegocio
    {
        public override int StatusCode => StatusCodes.Status422UnprocessableEntity;
        public override string Titulo => "Regra de negócio violada";

        public RegraDeNegocioInfringidaException(string message)
        : base(message) { }

        public RegraDeNegocioInfringidaException(string message, Exception inner)
            : base(message, inner) { }
    }
}
