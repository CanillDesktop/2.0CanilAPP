using System.Globalization;
using Backend.DTOs.Estoque;
using Backend.Models.Estoque;
using Backend.Models.Insumos;
using Backend.Models.Medicamentos;
using Backend.Models.Produtos;
using Backend.Repositories;

namespace Backend.Services;

/// <summary>
/// Projeta um item agregado (produto/medicamento/insumo) na linha operacional de estoque.
/// Espelha a lógica que rodava client-side em PaginaListagemEstoque.
/// </summary>
internal static class EstoqueLinhaMapper
{
    private static readonly CultureInfo PtBr = CultureInfo.GetCultureInfo("pt-BR");

    public static EstoqueLinhaLeituraDTO ParaDto(ItemComEstoqueBaseModel model, EstoqueOrigem origem)
    {
        var lotes = model.ItensEstoque?.Where(e => !e.IsDeleted).ToList() ?? [];
        var quantidade = lotes.Sum(e => e.Quantidade);
        var minimo = model.ItemNivelEstoque?.NivelMinimoEstoque ?? 0;

        var hoje = DateTime.UtcNow.Date;
        var limite = EstoqueStatusCalculo.LimiteVencimento(hoje);

        var menorValidade = lotes
            .Where(e => e.DataValidade.HasValue)
            .Select(e => e.DataValidade!.Value)
            .OrderBy(d => d)
            .FirstOrDefault();

        var ultimaMovimentacao = lotes
            .Select(e => e.DataEntrega)
            .OrderByDescending(d => d)
            .FirstOrDefault();

        var temProximoVencimento = lotes.Any(e =>
            e.DataValidade.HasValue
            && e.DataValidade.Value.Date >= hoje
            && e.DataValidade.Value.Date <= limite);

        var status = EstoqueStatusCalculo.Classificar(quantidade, minimo, temProximoVencimento);

        return new EstoqueLinhaLeituraDTO
        {
            Id = model.Id,
            Nome = ObterNome(model, origem),
            Quantidade = quantidade,
            Minimo = minimo,
            Validade = menorValidade == default
                ? "Sem validade"
                : menorValidade.ToString("dd/MM/yyyy", PtBr),
            Origem = origem,
            StatusOperacional = status,
            UltimaMovimentacao = ultimaMovimentacao == default
                ? "Sem movimentacao"
                : ultimaMovimentacao.ToString("dd/MM/yyyy", PtBr),
            MenorValidadeUtc = menorValidade == default ? null : menorValidade,
            UltimaMovimentacaoUtc = ultimaMovimentacao == default ? null : ultimaMovimentacao,
        };
    }

    private static string ObterNome(ItemComEstoqueBaseModel model, EstoqueOrigem origem) =>
        origem switch
        {
            EstoqueOrigem.Produto => ((ProdutosModel)model).DescricaoSimples,
            EstoqueOrigem.Medicamento => ((MedicamentosModel)model).NomeComercial,
            EstoqueOrigem.Insumo => ((InsumosModel)model).DescricaoSimplificada,
            _ => string.Empty,
        };
}
