using Backend.Models.Interfaces;

namespace Backend.DTOs;

public class ItemComEstoqueListaPaginadaDTO<T> where T : IEstoqueItem
{
    public IReadOnlyList<T> Items { get; set; } = [];

    public int TotalCount { get; set; }

    public int PageNumber { get; set; }

    public int PageSize { get; set; }

    public int TotalPages { get; set; }

    public ItemComEstoqueListaResumoDTO Resumo { get; set; } = new();
}
