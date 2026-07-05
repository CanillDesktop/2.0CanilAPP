using Backend.Models.Estoque;

namespace Backend.Utils;

internal static class ItemEstoqueOrdenacao
{
    public static IEnumerable<ItemEstoqueModel> MaisRecentesPrimeiro(IEnumerable<ItemEstoqueModel> lotes) =>
        lotes.OrderByDescending(e => e.DataHoraCriacao);
}
