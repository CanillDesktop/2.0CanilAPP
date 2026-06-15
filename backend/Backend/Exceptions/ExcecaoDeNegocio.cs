namespace Backend.Exceptions
{
    /// <summary>
    /// Base para erros esperados de regra de negócio. O middleware global converte estas
    /// exceções em respostas HTTP padronizadas (nunca 500). Use as classes derivadas em vez
    /// de lançar <see cref="System.InvalidOperationException"/> para situações previsíveis.
    /// </summary>
    public abstract class ExcecaoDeNegocio : Exception
    {
        /// <summary>Código HTTP apropriado para a violação (ex.: 400, 404, 409, 422).</summary>
        public abstract int StatusCode { get; }

        /// <summary>Título curto exibido no corpo padronizado de erro.</summary>
        public abstract string Titulo { get; }

        protected ExcecaoDeNegocio(string message) : base(message) { }

        protected ExcecaoDeNegocio(string message, Exception inner) : base(message, inner) { }
    }
}
