using Backend.Context;
using Backend.DTOs.Permissoes;
using Backend.Exceptions;
using Backend.Models.Estoque;
using Backend.Models.Permissoes;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class UsuarioPermissaoAtribuicaoService : IUsuarioPermissaoAtribuicaoService
{
    private readonly CanilAppDbContext _context;
    private readonly IPermissaoAuthorizationService _authorization;

    public UsuarioPermissaoAtribuicaoService(
        CanilAppDbContext context,
        IPermissaoAuthorizationService authorization)
    {
        _context = context;
        _authorization = authorization;
    }

    public async Task<UsuarioPermissoesEditorDTO> ObterEditorAsync(
        int idUsuario,
        CancellationToken cancellationToken = default)
    {
        await GarantirPodeGerenciarAsync(cancellationToken);

        var usuarioExiste = await _context.Usuarios.AsNoTracking()
            .AnyAsync(u => u.Id == idUsuario && u.Status != Models.Enums.StatusUsuario.Excluido, cancellationToken);

        if (!usuarioExiste)
            throw new RecursoNaoEncontradoException("Usuário não encontrado.");

        var permissoes = await _context.Permissoes.AsNoTracking()
            .Where(p => !p.IsDeleted)
            .OrderBy(p => p.Categoria)
            .ThenBy(p => p.Nome)
            .ToListAsync(cancellationToken);

        var unidades = await _context.UnidadesEstoque.AsNoTracking()
            .Where(u => u.Ativa && !u.IsDeleted)
            .OrderBy(u => u.Id)
            .ToListAsync(cancellationToken);

        var atribuidas = await _context.UsuariosPermissoes.AsNoTracking()
            .Where(a => a.IdUsuario == idUsuario)
            .Select(a => new { a.IdPermissao, a.IdUnidadeEstoque })
            .ToListAsync(cancellationToken);

        var chavesAtribuidas = atribuidas
            .Select(a => Chave(a.IdPermissao, a.IdUnidadeEstoque))
            .ToHashSet();

        var linhas = new List<PermissaoAtribuicaoLinhaDTO>();

        foreach (var permissao in permissoes)
        {
            if (!permissao.EscopoUnidadeEstoque)
            {
                linhas.Add(MontarLinha(permissao, null, null, chavesAtribuidas));
                continue;
            }

            foreach (var unidade in unidades)
            {
                linhas.Add(MontarLinha(permissao, unidade.Id, unidade.Nome, chavesAtribuidas));
            }
        }

        return new UsuarioPermissoesEditorDTO
        {
            IdUsuario = idUsuario,
            Linhas = linhas,
        };
    }

    public async Task SalvarAsync(
        int idUsuario,
        UsuarioPermissoesSalvarDTO dto,
        CancellationToken cancellationToken = default)
    {
        await GarantirPodeGerenciarAsync(cancellationToken);

        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Id == idUsuario && u.Status != Models.Enums.StatusUsuario.Excluido, cancellationToken)
            ?? throw new RecursoNaoEncontradoException("Usuário não encontrado.");

        var permissoes = await _context.Permissoes.AsNoTracking()
            .Where(p => !p.IsDeleted)
            .ToDictionaryAsync(p => p.Id, cancellationToken);

        var unidadesValidas = (await _context.UnidadesEstoque.AsNoTracking()
            .Where(u => u.Ativa && !u.IsDeleted)
            .Select(u => u.Id)
            .ToListAsync(cancellationToken)).ToHashSet();

        var novas = new List<UsuarioPermissaoModel>();
        var chavesInseridas = new HashSet<string>();

        foreach (var item in dto.Atribuicoes ?? [])
        {
            if (!permissoes.TryGetValue(item.IdPermissao, out var permissao))
                throw new RegraDeNegocioInfringidaException($"Permissão id {item.IdPermissao} não encontrada.");

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

            if (permissao.Codigo == PermissaoCodigos.SistemaAdministrador)
            {
                var cargoAdmin = await _context.Cargos.AsNoTracking()
                    .FirstOrDefaultAsync(c => c.Id == usuario.IdCargo && c.EhAdministradorSistema, cancellationToken);

                if (cargoAdmin is null)
                    throw new RegraDeNegocioInfringidaException(
                        "A permissão de administrador do sistema só pode ser atribuída via cargo Administrador.");
            }

            var chave = Chave(item.IdPermissao, item.IdUnidadeEstoque);
            if (!chavesInseridas.Add(chave))
                continue;

            novas.Add(new UsuarioPermissaoModel
            {
                IdUsuario = idUsuario,
                IdPermissao = item.IdPermissao,
                IdUnidadeEstoque = item.IdUnidadeEstoque,
            });
        }

        var atuais = await _context.UsuariosPermissoes
            .Where(a => a.IdUsuario == idUsuario)
            .ToListAsync(cancellationToken);

        _context.UsuariosPermissoes.RemoveRange(atuais);
        _context.UsuariosPermissoes.AddRange(novas);

        usuario.TokenVersion++;
        usuario.DataHoraAtualizacao = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
    }

    private async Task GarantirPodeGerenciarAsync(CancellationToken cancellationToken)
    {
        if (await PossuiPermissaoGerenciarUsuariosAsync(cancellationToken))
            return;

        throw new AcessoNegadoException("Sem permissão para gerenciar permissões de usuários.");
    }

    internal static async Task<bool> PossuiPermissaoGerenciarUsuariosAsync(
        IPermissaoAuthorizationService authorization,
        CancellationToken cancellationToken = default)
    {
        if (await authorization.PossuiPermissaoAsync(
                PermissaoCodigos.UsuariosPermissoesGerenciar,
                cancellationToken: cancellationToken))
            return true;

        // Compatibilidade com permissão anterior (escopo de unidade).
        return await authorization.PossuiPermissaoAsync(
            PermissaoCodigos.UsuariosGerenciarVinculosUnidade,
            cancellationToken: cancellationToken);
    }

    private Task<bool> PossuiPermissaoGerenciarUsuariosAsync(CancellationToken cancellationToken) =>
        PossuiPermissaoGerenciarUsuariosAsync(_authorization, cancellationToken);

    private static PermissaoAtribuicaoLinhaDTO MontarLinha(
        PermissaoModel permissao,
        int? idUnidade,
        string? nomeUnidade,
        HashSet<string> chavesAtribuidas)
    {
        var chave = Chave(permissao.Id, idUnidade);
        return new PermissaoAtribuicaoLinhaDTO
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
