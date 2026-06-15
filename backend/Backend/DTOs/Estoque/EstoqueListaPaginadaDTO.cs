using Backend.DTOs.Produtos;

namespace Backend.DTOs.Estoque
{
    public class EstoqueListaPaginadaDTO
    {
        public IReadOnlyList<ItemEstoqueDTO> Itens { get; set; } = new List<ItemEstoqueDTO>();
        public int TotalCount { get; set; }

        public int PageNumber { get; set; }

        public int PageSize { get; set; }

        public int TotalPages { get; set; }

        public ProdutosListaResumoDTO Resumo { get; set; } = new();
    }
}
