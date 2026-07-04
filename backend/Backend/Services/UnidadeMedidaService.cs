using Backend.DTOs.UnidadeMedida;
using Backend.Exceptions;
using Backend.Models.Enums;
using Backend.Models.UnidadeMedida;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;

namespace Backend.Services;

public class UnidadeMedidaService : IUnidadeMedidaService
{
    private readonly IUnidadeMedidaRepository _repository;
    private readonly IUserSessionService _userSession;
    private readonly IUsuariosService _usuariosService;

    public UnidadeMedidaService(
        IUnidadeMedidaRepository repository,
        IUserSessionService userSession,
        IUsuariosService usuariosService)
    {
        _repository = repository;
        _userSession = userSession;
        _usuariosService = usuariosService;
    }

    public async Task<IReadOnlyList<UnidadeMedidaDTO>> ListarAsync(
        TipoItemUnidadeMedida? aplicavelA = null,
        bool apenasAtivas = true,
        CancellationToken cancellationToken = default)
    {
        var itens = await _repository.ListarAsync(aplicavelA, apenasAtivas, cancellationToken);
        return itens.Select(ParaDto).ToList();
    }

    public async Task<UnidadeMedidaDTO?> ObterPorIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var model = await _repository.ObterPorIdAsync(id, cancellationToken);
        return model is null ? null : ParaDto(model);
    }

    public async Task<UnidadeMedidaDTO> CriarAsync(
        UnidadeMedidaCadastroDTO dto,
        CancellationToken cancellationToken = default)
    {
        await GarantirPodeGerenciarAsync(cancellationToken);
        ValidarDto(dto);

        var nome = dto.Nome.Trim();
        if (await _repository.ObterPorNomeAsync(nome, cancellationToken) is not null)
            throw new RegraDeNegocioInfringidaException("Já existe uma unidade de medida com este nome.");

        var model = new UnidadeMedidaModel
        {
            Nome = nome,
            Sigla = NormalizarSigla(dto.Sigla),
            AplicavelProduto = dto.AplicavelProduto,
            AplicavelMedicamento = dto.AplicavelMedicamento,
            AplicavelInsumo = dto.AplicavelInsumo,
            Ativa = dto.Ativa,
            EditadorPor = _userSession.EditedBy ?? string.Empty,
        };

        var criado = await _repository.CriarAsync(model, cancellationToken);
        return ParaDto(criado);
    }

    public async Task<UnidadeMedidaDTO> AtualizarAsync(
        int id,
        UnidadeMedidaAtualizacaoDTO dto,
        CancellationToken cancellationToken = default)
    {
        await GarantirPodeGerenciarAsync(cancellationToken);
        ValidarDto(dto);

        var model = await _repository.ObterPorIdAsync(id, cancellationToken)
            ?? throw new ArgumentNullException(null, "Unidade de medida não encontrada.");

        var nome = dto.Nome.Trim();
        var existente = await _repository.ObterPorNomeAsync(nome, cancellationToken);
        if (existente is not null && existente.Id != id)
            throw new RegraDeNegocioInfringidaException("Já existe uma unidade de medida com este nome.");

        model.Nome = nome;
        model.Sigla = NormalizarSigla(dto.Sigla);
        model.AplicavelProduto = dto.AplicavelProduto;
        model.AplicavelMedicamento = dto.AplicavelMedicamento;
        model.AplicavelInsumo = dto.AplicavelInsumo;
        model.Ativa = dto.Ativa;
        model.DataHoraAtualizacao = DateTime.UtcNow;
        model.EditadorPor = _userSession.EditedBy ?? string.Empty;

        var atualizado = await _repository.AtualizarAsync(model, cancellationToken);
        return ParaDto(atualizado);
    }

    public async Task GarantirAplicavelAsync(
        int idUnidadeMedida,
        TipoItemUnidadeMedida tipo,
        CancellationToken cancellationToken = default)
    {
        if (idUnidadeMedida <= 0)
            throw new ModelIncompletaException("Unidade de medida é obrigatória.");

        if (!await _repository.ExisteAplicavelAsync(idUnidadeMedida, tipo, cancellationToken))
            throw new RegraDeNegocioInfringidaException(
                "Unidade de medida inválida, inativa ou não aplicável a este tipo de item.");
    }

    public async Task<string> ObterRotuloAsync(int idUnidadeMedida, CancellationToken cancellationToken = default)
    {
        var model = await _repository.ObterPorIdAsync(idUnidadeMedida, cancellationToken);
        if (model is null) return $"Unidade {idUnidadeMedida}";
        return string.IsNullOrWhiteSpace(model.Sigla) ? model.Nome : $"{model.Nome} ({model.Sigla})";
    }

    private async Task GarantirPodeGerenciarAsync(CancellationToken cancellationToken)
    {
        if (!int.TryParse(_userSession.UserId, out var idUsuario) || idUsuario <= 0)
            throw new AcessoNegadoException("Usuário não autenticado.");

        if (!await _usuariosService.UsuarioPodeGerenciarUnidadesMedidaAsync(idUsuario, cancellationToken))
            throw new AcessoNegadoException(
                "Sem permissão para gerenciar o catálogo de unidades de medida. Solicite ao administrador.");
    }

    private static void ValidarDto(UnidadeMedidaCadastroDTO dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Nome))
            throw new ModelIncompletaException("Nome da unidade de medida é obrigatório.");

        if (!dto.AplicavelProduto && !dto.AplicavelMedicamento && !dto.AplicavelInsumo)
            throw new RegraDeNegocioInfringidaException(
                "Selecione ao menos um tipo de item (produto, medicamento ou insumo).");
    }

    private static string? NormalizarSigla(string? sigla) =>
        string.IsNullOrWhiteSpace(sigla) ? null : sigla.Trim().ToUpperInvariant();

    private static UnidadeMedidaDTO ParaDto(UnidadeMedidaModel model) => new()
    {
        Id = model.Id,
        Nome = model.Nome,
        Sigla = model.Sigla,
        AplicavelProduto = model.AplicavelProduto,
        AplicavelMedicamento = model.AplicavelMedicamento,
        AplicavelInsumo = model.AplicavelInsumo,
        Ativa = model.Ativa,
    };
}
