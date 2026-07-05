using Backend.Context;
using Backend.Models.Cargos;
using Backend.Models.Estoque;
using Backend.Models.Enums;
using Backend.Models.Permissoes;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public static class PermissaoSeed
{
    private static readonly (string Codigo, string Nome, string Categoria, bool EscopoUnidade, string? Descricao)[] DefinicoesPadrao =
    [
        (PermissaoCodigos.SistemaAdministrador, "Administrador do sistema", "Sistema", false,
            "Acesso total; ignora demais verificações de permissão."),
        (PermissaoCodigos.UsuariosListar, "Listar usuários", "Usuários", false, null),
        (PermissaoCodigos.UsuariosCriar, "Criar usuários", "Usuários", false, null),
        (PermissaoCodigos.UsuariosEditar, "Editar usuários", "Usuários", false, null),
        (PermissaoCodigos.UsuariosInativar, "Inativar usuários", "Usuários", false, null),
        (PermissaoCodigos.UsuariosReativar, "Reativar usuários", "Usuários", false, null),
        (PermissaoCodigos.UsuariosExcluir, "Excluir usuários", "Usuários", false, null),
        (PermissaoCodigos.UsuariosGerenciarVinculosUnidade, "Gerenciar vínculos Secretaria/Canil", "Usuários", false,
            "Define quais unidades de estoque o usuário acessa e com quais operações."),
        (PermissaoCodigos.UsuariosPermissoesGerenciar, "Gerenciar permissões de usuários", "Usuários", false,
            "Altera cargo, vínculos por unidade de estoque e demais permissões efetivas de outros usuários."),
        (PermissaoCodigos.UsuariosSenhaVisualizar, "Visualizar senha de outros usuários", "Usuários", false,
            "Consulta se o usuário possui senha cadastrada. O texto original não pode ser exibido (armazenamento seguro)."),
        (PermissaoCodigos.UsuariosSenhaAlterar, "Alterar senha de outros usuários", "Usuários", false,
            "Permite definir uma nova senha para outro usuário sem informar a senha atual dele."),
        (PermissaoCodigos.CodigoSegurancaEditar, "Editar código de acesso", "Sistema", false, null),
        (PermissaoCodigos.UnidadesMedidaGerenciar, "Gerenciar catálogo de medidas", "Catálogo", false, null),
        (PermissaoCodigos.PermissoesCatalogoVisualizar, "Visualizar catálogo de permissões", "Permissões", false, null),
        (PermissaoCodigos.PermissoesCatalogoGerenciar, "Criar e editar permissões", "Permissões", false,
            "Permite cadastrar novas permissões no sistema."),
        (PermissaoCodigos.CargosGerenciar, "Gerenciar cargos", "Cargos", false,
            "Permite criar cargos e definir permissões por cargo."),
        (PermissaoCodigos.EstoqueConsultar, "Consultar estoque", "Estoque", true, "Unidade: Secretaria ou Canil."),
        (PermissaoCodigos.EstoqueEntrada, "Registrar entradas", "Estoque", true, null),
        (PermissaoCodigos.EstoqueSaida, "Registrar saídas", "Estoque", true, null),
        (PermissaoCodigos.EstoqueTransferirEnviar, "Enviar transferências", "Estoque", true, null),
        (PermissaoCodigos.EstoqueTransferirReceber, "Receber transferências", "Estoque", true, null),
    ];

    public static async Task GarantirCatalogoEAtribuicoesAsync(CanilAppDbContext context, CancellationToken cancellationToken = default)
    {
        await GarantirCatalogoAsync(context, cancellationToken);
        await CargoSeed.GarantirCargosEPermissoesAsync(context, cancellationToken);
        await SincronizarAtribuicoesUsuariosAsync(context, cancellationToken);
    }

    private static async Task GarantirCatalogoAsync(CanilAppDbContext context, CancellationToken cancellationToken)
    {
        var existentes = await context.Permissoes.AsNoTracking()
            .Select(p => p.Codigo)
            .ToListAsync(cancellationToken);

        var agora = DateTime.UtcNow;
        foreach (var def in DefinicoesPadrao)
        {
            if (existentes.Contains(def.Codigo))
                continue;

            context.Permissoes.Add(new PermissaoModel
            {
                Codigo = def.Codigo,
                Nome = def.Nome,
                Descricao = def.Descricao,
                Categoria = def.Categoria,
                EscopoUnidadeEstoque = def.EscopoUnidade,
                EhSistema = true,
                DataHoraCriacao = agora,
                DataHoraAtualizacao = agora,
                EditadorPor = "Sistema",
            });
        }

        await context.SaveChangesAsync(cancellationToken);
    }

    public static async Task SincronizarAtribuicoesUsuariosAsync(
        CanilAppDbContext context,
        CancellationToken cancellationToken = default)
    {
        var permissoes = await context.Permissoes.AsNoTracking()
            .Where(p => !p.IsDeleted)
            .ToDictionaryAsync(p => p.Id, cancellationToken);

        if (permissoes.Count == 0)
            return;

        var cargos = await context.Cargos.AsNoTracking()
            .Where(c => !c.IsDeleted)
            .ToDictionaryAsync(c => c.Id, cancellationToken);

        var cargoPermissoes = await context.CargosPermissoes.AsNoTracking()
            .ToListAsync(cancellationToken);

        var permissoesPorCargo = cargoPermissoes
            .GroupBy(cp => cp.IdCargo)
            .ToDictionary(g => g.Key, g => g.ToList());

        var usuarios = await context.Usuarios.AsNoTracking()
            .Where(u => u.Status != StatusUsuario.Excluido)
            .Select(u => new { u.Id, u.IdCargo, u.PodeGerenciarUnidadesMedida })
            .ToListAsync(cancellationToken);

        foreach (var usuario in usuarios)
        {
            var vinculos = await context.UsuariosUnidadesEstoque.AsNoTracking()
                .Where(v => v.IdUsuario == usuario.Id)
                .ToListAsync(cancellationToken);

            cargos.TryGetValue(usuario.IdCargo, out var cargo);
            permissoesPorCargo.TryGetValue(usuario.IdCargo, out var atribuicoesCargo);

            var desejadas = MontarAtribuicoesDesejadas(
                usuario.Id,
                cargo,
                atribuicoesCargo ?? [],
                usuario.PodeGerenciarUnidadesMedida,
                vinculos,
                permissoes);

            await AplicarAtribuicoesUsuarioAsync(context, usuario.Id, desejadas, permissoes, cancellationToken);
        }

        await context.SaveChangesAsync(cancellationToken);
    }

    public static async Task SincronizarAtribuicoesUsuarioAsync(
        CanilAppDbContext context,
        int idUsuario,
        CancellationToken cancellationToken = default)
    {
        var permissoes = await context.Permissoes.AsNoTracking()
            .Where(p => !p.IsDeleted)
            .ToDictionaryAsync(p => p.Id, cancellationToken);

        if (permissoes.Count == 0)
            return;

        var usuario = await context.Usuarios.AsNoTracking()
            .Where(u => u.Id == idUsuario)
            .Select(u => new { u.Id, u.IdCargo, u.PodeGerenciarUnidadesMedida })
            .FirstOrDefaultAsync(cancellationToken);

        if (usuario is null)
            return;

        var cargo = await context.Cargos.AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == usuario.IdCargo && !c.IsDeleted, cancellationToken);

        var atribuicoesCargo = await context.CargosPermissoes.AsNoTracking()
            .Where(cp => cp.IdCargo == usuario.IdCargo)
            .ToListAsync(cancellationToken);

        var vinculos = await context.UsuariosUnidadesEstoque.AsNoTracking()
            .Where(v => v.IdUsuario == idUsuario)
            .ToListAsync(cancellationToken);

        var desejadas = MontarAtribuicoesDesejadas(
            usuario.Id,
            cargo,
            atribuicoesCargo,
            usuario.PodeGerenciarUnidadesMedida,
            vinculos,
            permissoes);

        await AplicarAtribuicoesUsuarioAsync(context, idUsuario, desejadas, permissoes, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
    }

    internal static List<UsuarioPermissaoModel> MontarAtribuicoesDesejadas(
        int idUsuario,
        CargoModel? cargo,
        IReadOnlyList<CargoPermissaoModel> permissoesCargo,
        bool podeGerenciarUnidadesMedida,
        IReadOnlyList<UsuarioUnidadeEstoqueModel> vinculos,
        IReadOnlyDictionary<int, PermissaoModel> permissoes)
    {
        var resultado = new List<UsuarioPermissaoModel>();
        var chaves = new HashSet<string>();

        void Adicionar(int idPermissao, int? idUnidade)
        {
            var chave = ChaveAtribuicao(idPermissao, idUnidade);
            if (!chaves.Add(chave))
                return;

            resultado.Add(new UsuarioPermissaoModel
            {
                IdUsuario = idUsuario,
                IdPermissao = idPermissao,
                IdUnidadeEstoque = idUnidade,
            });
        }

        if (cargo?.EhAdministradorSistema == true)
        {
            foreach (var permissao in permissoes.Values)
            {
                if (!permissao.EscopoUnidadeEstoque)
                    Adicionar(permissao.Id, null);
            }

            foreach (var unidadeId in new[] { UnidadeEstoqueIds.Secretaria, UnidadeEstoqueIds.Canil })
            {
                foreach (var permissao in permissoes.Values.Where(p => p.EscopoUnidadeEstoque))
                    Adicionar(permissao.Id, unidadeId);
            }

            return resultado;
        }

        foreach (var atribuicao in permissoesCargo)
        {
            if (!permissoes.TryGetValue(atribuicao.IdPermissao, out var permissao))
                continue;

            if (!permissao.EscopoUnidadeEstoque)
            {
                Adicionar(atribuicao.IdPermissao, null);
                continue;
            }

            if (atribuicao.IdUnidadeEstoque is null or <= 0)
                continue;

            var vinculo = vinculos.FirstOrDefault(v => v.IdUnidadeEstoque == atribuicao.IdUnidadeEstoque);
            if (vinculo is null)
                continue;

            if (!UnidadePermiteOperacao(vinculo, permissao.Codigo))
                continue;

            Adicionar(atribuicao.IdPermissao, atribuicao.IdUnidadeEstoque);
        }

        if (podeGerenciarUnidadesMedida)
        {
            var unidadesMedida = permissoes.Values.FirstOrDefault(p => p.Codigo == PermissaoCodigos.UnidadesMedidaGerenciar);
            if (unidadesMedida is not null)
                Adicionar(unidadesMedida.Id, null);
        }

        return resultado;
    }

    private static bool UnidadePermiteOperacao(UsuarioUnidadeEstoqueModel vinculo, string codigo) =>
        codigo switch
        {
            PermissaoCodigos.EstoqueConsultar => vinculo.PodeConsultar,
            PermissaoCodigos.EstoqueEntrada => vinculo.PodeEntrada,
            PermissaoCodigos.EstoqueSaida => vinculo.PodeSaida,
            PermissaoCodigos.EstoqueTransferirEnviar => vinculo.PodeTransferirEnviar,
            PermissaoCodigos.EstoqueTransferirReceber => vinculo.PodeTransferirReceber,
            _ => true,
        };

    private static async Task AplicarAtribuicoesUsuarioAsync(
        CanilAppDbContext context,
        int idUsuario,
        IReadOnlyList<UsuarioPermissaoModel> desejadas,
        IReadOnlyDictionary<int, PermissaoModel> permissoes,
        CancellationToken cancellationToken)
    {
        var atuais = await context.UsuariosPermissoes
            .Where(a => a.IdUsuario == idUsuario)
            .ToListAsync(cancellationToken);

        var chavesDesejadas = desejadas
            .Select(a => ChaveAtribuicao(a.IdPermissao, a.IdUnidadeEstoque))
            .ToHashSet();

        context.UsuariosPermissoes.RemoveRange(
            atuais.Where(a => !chavesDesejadas.Contains(ChaveAtribuicao(a.IdPermissao, a.IdUnidadeEstoque))));

        var chavesAtuais = atuais
            .Select(a => ChaveAtribuicao(a.IdPermissao, a.IdUnidadeEstoque))
            .ToHashSet();

        foreach (var desejada in desejadas)
        {
            var chave = ChaveAtribuicao(desejada.IdPermissao, desejada.IdUnidadeEstoque);
            if (chavesAtuais.Contains(chave))
                continue;

            context.UsuariosPermissoes.Add(desejada);
        }
    }

    private static string ChaveAtribuicao(int idPermissao, int? idUnidade) =>
        $"{idPermissao}:{idUnidade?.ToString() ?? "global"}";
}
