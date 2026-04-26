using Backend.DTOs.Estoque;

namespace Backend.Models.Interfaces
{
    public interface IEstoqueItem
    {
        int Id { get; init; }
        string Codigo { get; set; }
        string NomeOuDescricaoSimples { get; set; }
        ItemNivelEstoqueDTO? ItemNivelEstoque { get; set; }
        ItemEstoqueDTO[]? ItensEstoque { get; set; }
    }
}
