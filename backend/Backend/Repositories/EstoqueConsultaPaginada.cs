using Backend.Models.Estoque;

namespace Backend.Repositories;

/// <summary>
/// Resultado materializado da consulta paginada (uma página de modelos + total).
/// O Service projeta para EstoqueLinhaLeituraDTO.
/// </summary>
/// <param name="Items">Página com ItensEstoque e ItemNivelEstoque incluídos.</param>
/// <param name="TotalCount">Total após filtros (antes de Skip/Take).</param>
public sealed record EstoqueConsultaPaginada(
    IReadOnlyList<ItemComEstoqueBaseModel> Items,
    int TotalCount);
