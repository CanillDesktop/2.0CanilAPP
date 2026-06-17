using Backend.DTOs.Common;
using Backend.DTOs.Estoque;
using Backend.Pagination;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;

namespace Backend.Services;

public class EstoqueConsultaService : IEstoqueConsultaService
{
    private static readonly HashSet<string> OrderByPermitidos = new(StringComparer.OrdinalIgnoreCase)
    {
        "nome", "quantidade", "validade", "status", "ultimamovimentacao",
    };

    private readonly IEstoqueConsultaRepository _repository;

    public EstoqueConsultaService(IEstoqueConsultaRepository repository) =>
        _repository = repository;

    public async Task<PagedResultDto<EstoqueLinhaLeituraDTO>> ConsultarPaginadoAsync(
        EstoqueFiltroDTO filtro,
        EstoqueConsultaParameters parameters,
        CancellationToken cancellationToken = default)
    {
        ValidarEntrada(filtro, parameters);

        var consulta = await _repository.ConsultarPaginadoAsync(filtro, parameters, cancellationToken);

        var linhas = consulta.Items
            .Select(m => EstoqueLinhaMapper.ParaDto(m, filtro.Origem))
            .ToList();

        return PagedResultFactory.Create(
            linhas,
            consulta.TotalCount,
            parameters.NormalizedPageNumber,
            parameters.PageSize);
    }

    public async Task<EstoqueContagemPorOrigemDTO> ObterContagemPorOrigemAsync(
        CancellationToken cancellationToken = default)
    {
        var contagem = await _repository.ObterContagemPorOrigemAsync(cancellationToken);

        return new EstoqueContagemPorOrigemDTO
        {
            Produtos = contagem.Produtos,
            Medicamentos = contagem.Medicamentos,
            Insumos = contagem.Insumos,
        };
    }

    private static void ValidarEntrada(EstoqueFiltroDTO filtro, EstoqueConsultaParameters parameters)
    {
        if (!Enum.IsDefined(typeof(EstoqueOrigem), filtro.Origem))
            throw new ArgumentException("Origem de estoque inválida.", nameof(filtro));

        if (!EstoqueStatusOperacional.IsValid(filtro.StatusOperacional))
            throw new ArgumentException(
                "Status operacional inválido. Valores: ok, baixo, proximo_vencimento, critico.",
                nameof(filtro));

        if (filtro.QuantidadeMinima is int qMin
            && filtro.QuantidadeMaxima is int qMax
            && qMin > qMax)
        {
            throw new ArgumentException(
                "Quantidade mínima não pode ser maior que a máxima.",
                nameof(filtro));
        }

        if (!OrderByPermitidos.Contains(parameters.NormalizedOrderBy))
            throw new ArgumentException(
                "Campo de ordenação inválido. Valores: nome, quantidade, validade, status, ultimaMovimentacao.",
                nameof(parameters));
    }
}
