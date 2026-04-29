namespace Backend.DTOs.Busca
{
    public class BuscaItemDTO
    {
        public int Id { get; init; }
        public string NomeOuDescricaoSimples { get; init; } = string.Empty;
        public string Tipo { get; init; } = string.Empty;
    }
}
