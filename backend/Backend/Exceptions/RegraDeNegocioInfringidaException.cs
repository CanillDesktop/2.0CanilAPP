namespace Backend.Exceptions
{
    public class RegraDeNegocioInfringidaException : Exception
    {
        public RegraDeNegocioInfringidaException(string message)
        : base(message) { }

        public RegraDeNegocioInfringidaException(string message, Exception inner)
            : base(message, inner) { }
    }
}
