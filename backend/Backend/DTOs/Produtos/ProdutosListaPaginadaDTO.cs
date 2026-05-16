namespace Backend.DTOs.Produtos;

public class ProdutosListaPaginadaDTO
{
    public IReadOnlyList<ProdutosLeituraDTO> Items { get; set; } = [];

    public int TotalCount { get; set; }

    public int PageNumber { get; set; }

    public int PageSize { get; set; }

    public int TotalPages { get; set; }

    public ProdutosListaResumoDTO Resumo { get; set; } = new();
}
