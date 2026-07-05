using Backend.Context;
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
        (PermissaoCodigos.CodigoSegurancaEditar, "Editar código de acesso", "Sistema", false, null),
        (PermissaoCodigos.UnidadesMedidaGerenciar, "Gerenciar catálogo de medidas", "Catálogo", false, null),
        (PermissaoCodigos.PermissoesCatalogoVisualizar, "Visualizar catálogo de permissões", "Permissões", false, null),
        (PermissaoCodigos.PermissoesCatalogoGerenciar, "Criar e editar permissões", "Permissões", false,
            "Permite cadastrar novas permissões no sistema."),
        (PermissaoCodigos.EstoqueConsultar, "Consultar estoque", "Estoque", true, "Unidade: Secretaria ou Canil."),
        (PermissaoCodigos.EstoqueEntrada, "Registrar entradas", "Estoque", true, null),
        (PermissaoCodigos.EstoqueSaida, "Registrar saídas", "Estoque", true, null),
        (PermissaoCodigos.EstoqueTransferirEnviar, "Enviar transferências", "Estoque", true, null),
        (PermissaoCodigos.EstoqueTransferirReceber, "Receber transferências", "Estoque", true, null),
    ];

    public static async Task GarantirCatalogoEAtribuicoesAsync(CanilAppDbContext context, CancellationToken cancellationToken = default)
    {
        await GarantirCatalogoAsync(context, cancellationToken);
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
            .ToDictionaryAsync(p => p.Codigo, cancellationToken);

        if (permissoes.Count == 0)
            return;

        var usuarios = await context.Usuarios.AsNoTracking()
            .Where(u => u.Status != StatusUsuario.Excluido)
            .Select(u => new { u.Id, u.Permissao, u.PodeGerenciarUnidadesMedida })
            .ToListAsync(cancellationToken);

        foreach (var usuario in usuarios)
        {
            var vinculos = await context.UsuariosUnidadesEstoque.AsNoTracking()
                .Where(v => v.IdUsuario == usuario.Id)
                .ToListAsync(cancellationToken);

            var desejadas = MontarAtribuicoesDesejadas(
                usuario.Id,
                usuario.Permissao,
                usuario.PodeGerenciarUnidadesMedida,
                vinculos,
                permissoes);

            var idsCustom = permissoes.Values.Where(p => !p.EhSistema).Select(p => p.Id).ToHashSet();

            var atuais = await context.UsuariosPermissoes
                .Where(a => a.IdUsuario == usuario.Id)
                .ToListAsync(cancellationToken);

            var chavesDesejadas = desejadas
                .Select(a => ChaveAtribuicao(a.IdPermissao, a.IdUnidadeEstoque))
                .ToHashSet();

            var sistemaAtuais = atuais.Where(a => !idsCustom.Contains(a.IdPermissao)).ToList();
            var remover = sistemaAtuais
                .Where(a => !chavesDesejadas.Contains(ChaveAtribuicao(a.IdPermissao, a.IdUnidadeEstoque)))
                .ToList();

            if (remover.Count > 0)
                context.UsuariosPermissoes.RemoveRange(remover);

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

        await context.SaveChangesAsync(cancellationToken);
    }

    internal static List<UsuarioPermissaoModel> MontarAtribuicoesDesejadas(
        int idUsuario,
        PermissoesEnum permissaoConta,
        bool podeGerenciarUnidadesMedida,
        IReadOnlyList<UsuarioUnidadeEstoqueModel> vinculos,
        IReadOnlyDictionary<string, PermissaoModel> permissoes)
    {
        var resultado = new List<UsuarioPermissaoModel>();

        void AdicionarGlobal(string codigo)
        {
            if (!permissoes.TryGetValue(codigo, out var permissao))
                return;

            resultado.Add(new UsuarioPermissaoModel
            {
                IdUsuario = idUsuario,
                IdPermissao = permissao.Id,
                IdUnidadeEstoque = null,
            });
        }

        void AdicionarUnidade(int idUnidade, string codigo)
        {
            if (!permissoes.TryGetValue(codigo, out var permissao))
                return;

            resultado.Add(new UsuarioPermissaoModel
            {
                IdUsuario = idUsuario,
                IdPermissao = permissao.Id,
                IdUnidadeEstoque = idUnidade,
            });
        }

        if (permissaoConta == PermissoesEnum.ADMIN)
        {
            foreach (var codigo in PermissaoCodigos.Todas)
                AdicionarGlobal(codigo);

            foreach (var unidadeId in new[] { UnidadeEstoqueIds.Secretaria, UnidadeEstoqueIds.Canil })
            {
                AdicionarUnidade(unidadeId, PermissaoCodigos.EstoqueConsultar);
                AdicionarUnidade(unidadeId, PermissaoCodigos.EstoqueEntrada);
                AdicionarUnidade(unidadeId, PermissaoCodigos.EstoqueSaida);
                AdicionarUnidade(unidadeId, PermissaoCodigos.EstoqueTransferirEnviar);
                AdicionarUnidade(unidadeId, PermissaoCodigos.EstoqueTransferirReceber);
            }

            return resultado;
        }

        AdicionarGlobal(PermissaoCodigos.PermissoesCatalogoVisualizar);

        if (podeGerenciarUnidadesMedida)
            AdicionarGlobal(PermissaoCodigos.UnidadesMedidaGerenciar);

        foreach (var v in vinculos)
        {
            if (v.PodeConsultar)
                AdicionarUnidade(v.IdUnidadeEstoque, PermissaoCodigos.EstoqueConsultar);
            if (v.PodeEntrada)
                AdicionarUnidade(v.IdUnidadeEstoque, PermissaoCodigos.EstoqueEntrada);
            if (v.PodeSaida)
                AdicionarUnidade(v.IdUnidadeEstoque, PermissaoCodigos.EstoqueSaida);
            if (v.PodeTransferirEnviar)
                AdicionarUnidade(v.IdUnidadeEstoque, PermissaoCodigos.EstoqueTransferirEnviar);
            if (v.PodeTransferirReceber)
                AdicionarUnidade(v.IdUnidadeEstoque, PermissaoCodigos.EstoqueTransferirReceber);
        }

        return resultado;
    }

    public static async Task SincronizarAtribuicoesUsuarioAsync(
        CanilAppDbContext context,
        int idUsuario,
        CancellationToken cancellationToken = default)
    {
        var permissoes = await context.Permissoes.AsNoTracking()
            .Where(p => !p.IsDeleted)
            .ToDictionaryAsync(p => p.Codigo, cancellationToken);

        if (permissoes.Count == 0)
            return;

        var usuario = await context.Usuarios.AsNoTracking()
            .Where(u => u.Id == idUsuario)
            .Select(u => new { u.Id, u.Permissao, u.PodeGerenciarUnidadesMedida })
            .FirstOrDefaultAsync(cancellationToken);

        if (usuario is null)
            return;

        var vinculos = await context.UsuariosUnidadesEstoque.AsNoTracking()
            .Where(v => v.IdUsuario == idUsuario)
            .ToListAsync(cancellationToken);

        var desejadas = MontarAtribuicoesDesejadas(
            usuario.Id,
            usuario.Permissao,
            usuario.PodeGerenciarUnidadesMedida,
            vinculos,
            permissoes);

        var atuais = await context.UsuariosPermissoes
            .Where(a => a.IdUsuario == idUsuario)
            .ToListAsync(cancellationToken);

        var idsCustom = permissoes.Values.Where(p => !p.EhSistema).Select(p => p.Id).ToHashSet();

        var chavesDesejadas = desejadas
            .Select(a => ChaveAtribuicao(a.IdPermissao, a.IdUnidadeEstoque))
            .ToHashSet();

        var sistemaAtuais = atuais.Where(a => !idsCustom.Contains(a.IdPermissao)).ToList();
        context.UsuariosPermissoes.RemoveRange(
            sistemaAtuais.Where(a => !chavesDesejadas.Contains(ChaveAtribuicao(a.IdPermissao, a.IdUnidadeEstoque))));

        var chavesAtuais = atuais
            .Select(a => ChaveAtribuicao(a.IdPermissao, a.IdUnidadeEstoque))
            .ToHashSet();

        foreach (var desejada in desejadas)
        {
            var chave = ChaveAtribuicao(desejada.IdPermissao, desejada.IdUnidadeEstoque);
            if (chavesAtuais.Contains(chave))
                continue;

            context.UsuariosPermissoes.Add(desejada);
            chavesAtuais.Add(chave);
        }

        await context.SaveChangesAsync(cancellationToken);
    }

    private static string ChaveAtribuicao(int idPermissao, int? idUnidade) =>
        $"{idPermissao}:{idUnidade?.ToString() ?? "global"}";
}
