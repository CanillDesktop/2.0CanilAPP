using Backend.Context;
using Backend.Data;
using Backend.DTOs.Cargos;
using Backend.Exceptions;
using Backend.Models.Cargos;
using Backend.Models.Enums;
using Backend.Models.Permissoes;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class CargoPermissaoAtribuicaoService : ICargoPermissaoAtribuicaoService
{
    private readonly CanilAppDbContext _context;
    private readonly IPermissaoAuthorizationService _authorization;

    public CargoPermissaoAtribuicaoService(
        CanilAppDbContext context,
        IPermissaoAuthorizationService authorization)
    {
        _context = context;
        _authorization = authorization;
    }

    public async Task<CargoPermissoesEditorDTO> ObterEditorAsync(
        int idCargo,
        CancellationToken cancellationToken = default)
    {
        await _authorization.GarantirPermissaoAsync(PermissaoCodigos.CargosGerenciar, cancellationToken: cancellationToken);

        var cargo = await _context.Cargos.AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == idCargo && !c.IsDeleted, cancellationToken)
            ?? throw new RecursoNaoEncontradoException("Cargo não encontrado.");

        var permissoes = await _context.Permissoes.AsNoTracking()
            .Where(p => !p.IsDeleted)
            .OrderBy(p => p.Categoria)
            .ThenBy(p => p.Nome)
            .ToListAsync(cancellationToken);

        var unidades = await _context.UnidadesEstoque.AsNoTracking()
            .Where(u => u.Ativa && !u.IsDeleted)
            .OrderBy(u => u.Id)
            .ToListAsync(cancellationToken);

        var atribuidas = await _context.CargosPermissoes.AsNoTracking()
            .Where(a => a.IdCargo == idCargo)
            .Select(a => new { a.IdPermissao, a.IdUnidadeEstoque })
            .ToListAsync(cancellationToken);

        var chavesAtribuidas = atribuidas
            .Select(a => Chave(a.IdPermissao, a.IdUnidadeEstoque))
            .ToHashSet();

        var linhas = new List<CargoPermissaoAtribuicaoLinhaDTO>();

        foreach (var permissao in permissoes)
        {
            if (!permissao.EscopoUnidadeEstoque)
            {
                linhas.Add(MontarLinha(permissao, null, null, chavesAtribuidas));
                continue;
            }

            foreach (var unidade in unidades)
                linhas.Add(MontarLinha(permissao, unidade.Id, unidade.Nome, chavesAtribuidas));
        }

        return new CargoPermissoesEditorDTO
        {
            IdCargo = cargo.Id,
            NomeCargo = cargo.Nome,
            EhAdministradorSistema = cargo.EhAdministradorSistema,
            Linhas = linhas,
        };
    }

    public async Task SalvarAsync(
        int idCargo,
        CargoPermissoesSalvarDTO dto,
        CancellationToken cancellationToken = default)
    {
        await _authorization.GarantirPermissaoAsync(PermissaoCodigos.CargosGerenciar, cancellationToken: cancellationToken);

        var cargo = await _context.Cargos
            .FirstOrDefaultAsync(c => c.Id == idCargo && !c.IsDeleted, cancellationToken)
            ?? throw new RecursoNaoEncontradoException("Cargo não encontrado.");

        if (cargo.EhAdministradorSistema)
            throw new RegraDeNegocioInfringidaException(
                "O cargo Administrador possui todas as permissões automaticamente e não pode ser editado manualmente.");

        var permissoes = await _context.Permissoes.AsNoTracking()
            .Where(p => !p.IsDeleted)
            .ToDictionaryAsync(p => p.Id, cancellationToken);

        var unidadesValidas = (await _context.UnidadesEstoque.AsNoTracking()
            .Where(u => u.Ativa && !u.IsDeleted)
            .Select(u => u.Id)
            .ToListAsync(cancellationToken)).ToHashSet();

        var novas = new List<CargoPermissaoModel>();
        var chavesInseridas = new HashSet<string>();

        foreach (var item in dto.Atribuicoes ?? [])
        {
            if (!permissoes.TryGetValue(item.IdPermissao, out var permissao))
                throw new RegraDeNegocioInfringidaException($"Permissão id {item.IdPermissao} não encontrada.");

            if (permissao.Codigo == PermissaoCodigos.SistemaAdministrador)
                throw new RegraDeNegocioInfringidaException(
                    "A permissão de administrador do sistema só pode ser atribuída ao cargo Administrador.");

            if (permissao.EscopoUnidadeEstoque)
            {
                if (item.IdUnidadeEstoque is null or <= 0)
                    throw new RegraDeNegocioInfringidaException(
                        $"A permissão \"{permissao.Nome}\" exige uma unidade de estoque (Secretaria ou Canil).");

                if (!unidadesValidas.Contains(item.IdUnidadeEstoque.Value))
                    throw new RegraDeNegocioInfringidaException("Unidade de estoque inválida ou inativa.");
            }
            else if (item.IdUnidadeEstoque is not null)
            {
                throw new RegraDeNegocioInfringidaException(
                    $"A permissão \"{permissao.Nome}\" é global e não deve ter unidade associada.");
            }

            var chave = Chave(item.IdPermissao, item.IdUnidadeEstoque);
            if (!chavesInseridas.Add(chave))
                continue;

            novas.Add(new CargoPermissaoModel
            {
                IdCargo = idCargo,
                IdPermissao = item.IdPermissao,
                IdUnidadeEstoque = item.IdUnidadeEstoque,
            });
        }

        var atuais = await _context.CargosPermissoes
            .Where(a => a.IdCargo == idCargo)
            .ToListAsync(cancellationToken);

        _context.CargosPermissoes.RemoveRange(atuais);
        _context.CargosPermissoes.AddRange(novas);
        cargo.DataHoraAtualizacao = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        await PermissaoSeed.SincronizarAtribuicoesUsuariosAsync(_context, cancellationToken);
    }

    private static CargoPermissaoAtribuicaoLinhaDTO MontarLinha(
        PermissaoModel permissao,
        int? idUnidade,
        string? nomeUnidade,
        HashSet<string> chavesAtribuidas)
    {
        var chave = Chave(permissao.Id, idUnidade);
        return new CargoPermissaoAtribuicaoLinhaDTO
        {
            IdPermissao = permissao.Id,
            Codigo = permissao.Codigo,
            Nome = permissao.Nome,
            Categoria = permissao.Categoria,
            EscopoUnidadeEstoque = permissao.EscopoUnidadeEstoque,
            EhSistema = permissao.EhSistema,
            Atribuida = chavesAtribuidas.Contains(chave),
            IdUnidadeEstoque = idUnidade,
            NomeUnidade = nomeUnidade,
        };
    }

    private static string Chave(int idPermissao, int? idUnidade) =>
        $"{idPermissao}:{idUnidade?.ToString() ?? "global"}";
}
