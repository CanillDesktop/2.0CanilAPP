namespace Backend.DTOs.Estoque;

/// <summary>
/// Totais por aba (Produtos / Medicamentos / Insumos), sem os filtros da listagem.
/// Usado para os rótulos das abas em /estoque.
/// </summary>
public class EstoqueContagemPorOrigemDTO
{
    public int Produtos { get; set; }

    public int Medicamentos { get; set; }

    public int Insumos { get; set; }
}
