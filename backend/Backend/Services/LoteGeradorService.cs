using System.ComponentModel;
using System.Reflection;
using Backend.Context;
using Backend.Models.Enums;
using Backend.Models.Estoque;
using Backend.Services.Interfaces;
using Backend.Utils;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

/// <summary>
/// Geração centralizada e única de lotes. Os números sequenciais são controlados por tipo
/// (PRO/INS/MED) em uma tabela de contadores com concorrência otimista, garantindo unicidade
/// e que nenhum número seja reutilizado, mesmo após exclusão.
/// </summary>
public class LoteGeradorService : ILoteGeradorService
{
    private const int MaxTentativas = 6;

    private readonly CanilAppDbContext _context;

    public LoteGeradorService(CanilAppDbContext context)
    {
        _context = context;
    }

    public async Task<string> GerarLoteProdutoAsync(
        CategoriaEnum categoria,
        string descricaoSimples,
        CancellationToken cancellationToken = default)
        => PrefixoProduto(categoria, descricaoSimples) + await ProximoSequencialAsync("PRO", cancellationToken);

    public async Task<string> GerarLoteInsumoAsync(
        UnidadeInsumosEnum unidade,
        string descricaoSimplificada,
        CancellationToken cancellationToken = default)
        => PrefixoInsumo(unidade, descricaoSimplificada) + await ProximoSequencialAsync("INS", cancellationToken);

    public async Task<string> GerarLoteMedicamentoAsync(
        PublicoAlvoMedicamentoEnum publicoAlvo,
        string nomeComercial,
        CancellationToken cancellationToken = default)
        => PrefixoMedicamento(publicoAlvo, nomeComercial) + await ProximoSequencialAsync("MED", cancellationToken);

    public async Task<string> PreverProximoLoteProdutoAsync(
        CategoriaEnum categoria,
        string descricaoSimples,
        CancellationToken cancellationToken = default)
        => PrefixoProduto(categoria, descricaoSimples) + await PreverProximoSequencialAsync("PRO", cancellationToken);

    public async Task<string> PreverProximoLoteInsumoAsync(
        UnidadeInsumosEnum unidade,
        string descricaoSimplificada,
        CancellationToken cancellationToken = default)
        => PrefixoInsumo(unidade, descricaoSimplificada) + await PreverProximoSequencialAsync("INS", cancellationToken);

    public async Task<string> PreverProximoLoteMedicamentoAsync(
        PublicoAlvoMedicamentoEnum publicoAlvo,
        string nomeComercial,
        CancellationToken cancellationToken = default)
        => PrefixoMedicamento(publicoAlvo, nomeComercial) + await PreverProximoSequencialAsync("MED", cancellationToken);

    private static string PrefixoProduto(CategoriaEnum categoria, string descricaoSimples) =>
        "PRO"
        + TextoNormalizador.PrimeirasLetras(DescricaoOuNome(categoria), 2)
        + TextoNormalizador.PrimeirasLetras(descricaoSimples, 3);

    private static string PrefixoInsumo(UnidadeInsumosEnum unidade, string descricaoSimplificada) =>
        "INS"
        + TextoNormalizador.PrimeirasLetras(DescricaoOuNome(unidade), 3)
        + TextoNormalizador.PrimeirasLetras(descricaoSimplificada, 3);

    private static string PrefixoMedicamento(PublicoAlvoMedicamentoEnum publicoAlvo, string nomeComercial) =>
        "MED"
        + TokenPublicoAlvo(publicoAlvo)
        + TextoNormalizador.PrimeirasLetras(nomeComercial, 3);

    /// <summary>
    /// Lê o contador sem incrementá-lo, retornando o próximo número que <em>seria</em> gerado.
    /// Apenas para conferência: o valor definitivo só é fixado em <see cref="ProximoSequencialAsync"/>.
    /// </summary>
    private async Task<string> PreverProximoSequencialAsync(string tipo, CancellationToken cancellationToken)
    {
        var contador = await _context.ContadoresLote
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Tipo == tipo, cancellationToken);

        var proximo = (contador?.UltimoNumero ?? 0) + 1;
        return proximo.ToString("D6");
    }

    /// <summary>Público-alvo: T = humano e animal; A = exclusivamente animal.</summary>
    private static string TokenPublicoAlvo(PublicoAlvoMedicamentoEnum publicoAlvo) =>
        publicoAlvo == PublicoAlvoMedicamentoEnum.HumanoEAnimal ? "T" : "A";

    private async Task<string> ProximoSequencialAsync(string tipo, CancellationToken cancellationToken)
    {
        for (var tentativa = 1; ; tentativa++)
        {
            var contador = await _context.ContadoresLote
                .FirstOrDefaultAsync(c => c.Tipo == tipo, cancellationToken);

            if (contador == null)
            {
                contador = new ContadorLoteModel { Tipo = tipo, UltimoNumero = 0, Versao = 0 };
                _context.ContadoresLote.Add(contador);
            }

            contador.UltimoNumero += 1;
            contador.Versao += 1;

            try
            {
                await _context.SaveChangesAsync(cancellationToken);
                return contador.UltimoNumero.ToString("D6");
            }
            catch (Exception ex) when ((ex is DbUpdateConcurrencyException or DbUpdateException)
                                       && tentativa < MaxTentativas)
            {
                // Outra operação concorrente incrementou (ou inseriu) o contador.
                // Descarta o estado local e tenta novamente com o valor atualizado.
                foreach (var entry in _context.ChangeTracker.Entries<ContadorLoteModel>().ToList())
                    entry.State = EntityState.Detached;
            }
        }
    }

    private static string DescricaoOuNome(Enum valor)
    {
        var membro = valor.GetType().GetMember(valor.ToString()).FirstOrDefault();
        var descricao = membro?.GetCustomAttribute<DescriptionAttribute>()?.Description;
        return string.IsNullOrWhiteSpace(descricao) ? valor.ToString() : descricao;
    }
}
