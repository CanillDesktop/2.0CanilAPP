using Backend.Models.Enums;

namespace Backend.Services.Interfaces;

/// <summary>
/// Serviço central e reutilizável de geração de números de lote padronizados e únicos.
/// A geração ocorre exclusivamente no backend; o frontend apenas exibe o valor gerado.
/// </summary>
public interface ILoteGeradorService
{
    /// <summary>
    /// Gera o lote de um produto: PRO + Categoria + 3 primeiras letras da descrição + sequencial.
    /// </summary>
    Task<string> GerarLoteProdutoAsync(
        CategoriaEnum categoria,
        string descricaoSimples,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gera o lote de um insumo: INS + Unidade + 3 primeiras letras da descrição + sequencial.
    /// </summary>
    Task<string> GerarLoteInsumoAsync(
        UnidadeInsumosEnum unidade,
        string descricaoSimplificada,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gera o lote de um medicamento: MED + Público-alvo + 3 primeiras letras do nome comercial + sequencial.
    /// </summary>
    Task<string> GerarLoteMedicamentoAsync(
        PublicoAlvoMedicamentoEnum publicoAlvo,
        string nomeComercial,
        CancellationToken cancellationToken = default);
}
