namespace Backend.DTOs.Estoque;

/// <summary>
/// Origem da consulta de estoque (Opção A: uma aba/entidade por requisição).
/// </summary>
public enum EstoqueOrigem
{
    Produto = 0,
    Medicamento = 1,
    Insumo = 2,
}
