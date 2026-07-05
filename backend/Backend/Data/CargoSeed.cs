using Backend.Context;
using Backend.Models.Cargos;
using Backend.Models.Enums;
using Backend.Models.Permissoes;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public static class CargoSeed
{
    public static async Task GarantirCargosEPermissoesAsync(
        CanilAppDbContext context,
        CancellationToken cancellationToken = default)
    {
        await GarantirCargosAsync(context, cancellationToken);
        await SincronizarPermissoesCargosSistemaAsync(context, cancellationToken);
    }

    private static async Task GarantirCargosAsync(CanilAppDbContext context, CancellationToken cancellationToken)
    {
        var agora = DateTime.UtcNow;
        var existentes = await context.Cargos.AsNoTracking()
            .Select(c => c.Id)
            .ToListAsync(cancellationToken);

        if (!existentes.Contains(CargoModel.IdAdministrador))
        {
            context.Cargos.Add(new CargoModel
            {
                Id = CargoModel.IdAdministrador,
                Nome = "Administrador",
                Descricao = "Acesso total ao sistema.",
                EhAdministradorSistema = true,
                EhSistema = true,
                DataHoraCriacao = agora,
                DataHoraAtualizacao = agora,
                EditadorPor = "Sistema",
            });
        }

        if (!existentes.Contains(CargoModel.IdGrupoPadrao))
        {
            context.Cargos.Add(new CargoModel
            {
                Id = CargoModel.IdGrupoPadrao,
                Nome = CargoModel.NomeGrupoPadrao,
                Descricao = "Grupo padrão para novos usuários; permissões de estoque definidas por unidade.",
                EhAdministradorSistema = false,
                EhSistema = true,
                DataHoraCriacao = agora,
                DataHoraAtualizacao = agora,
                EditadorPor = "Sistema",
            });
        }
        else
        {
            var grupoPadrao = await context.Cargos
                .FirstOrDefaultAsync(c => c.Id == CargoModel.IdGrupoPadrao, cancellationToken);

            if (grupoPadrao is not null && grupoPadrao.Nome != CargoModel.NomeGrupoPadrao)
            {
                grupoPadrao.Nome = CargoModel.NomeGrupoPadrao;
                grupoPadrao.Descricao = "Grupo padrão para novos usuários; permissões de estoque definidas por unidade.";
                grupoPadrao.DataHoraAtualizacao = agora;
            }
        }

        await context.SaveChangesAsync(cancellationToken);
    }

    public static async Task SincronizarPermissoesCargosSistemaAsync(
        CanilAppDbContext context,
        CancellationToken cancellationToken = default)
    {
        var permissoes = await context.Permissoes.AsNoTracking()
            .Where(p => !p.IsDeleted)
            .ToDictionaryAsync(p => p.Codigo, cancellationToken);

        if (permissoes.Count == 0)
            return;

        await SincronizarCargoAdministradorAsync(context, permissoes, cancellationToken);
        await SincronizarCargoGrupoPadraoAsync(context, permissoes, cancellationToken);
    }

    private static async Task SincronizarCargoAdministradorAsync(
        CanilAppDbContext context,
        IReadOnlyDictionary<string, PermissaoModel> permissoes,
        CancellationToken cancellationToken)
    {
        var desejadas = MontarPermissoesAdministrador(permissoes);
        await AplicarPermissoesCargoAsync(context, CargoModel.IdAdministrador, desejadas, cancellationToken);
    }

    private static async Task SincronizarCargoGrupoPadraoAsync(
        CanilAppDbContext context,
        IReadOnlyDictionary<string, PermissaoModel> permissoes,
        CancellationToken cancellationToken)
    {
        var desejadas = new List<CargoPermissaoModel>();

        if (permissoes.TryGetValue(PermissaoCodigos.PermissoesCatalogoVisualizar, out var visualizar))
        {
            desejadas.Add(new CargoPermissaoModel
            {
                IdCargo = CargoModel.IdGrupoPadrao,
                IdPermissao = visualizar.Id,
                IdUnidadeEstoque = null,
            });
        }

        await AplicarPermissoesCargoAsync(context, CargoModel.IdGrupoPadrao, desejadas, cancellationToken);
    }

    internal static List<CargoPermissaoModel> MontarPermissoesAdministrador(
        IReadOnlyDictionary<string, PermissaoModel> permissoes)
    {
        var resultado = new List<CargoPermissaoModel>();

        foreach (var codigo in PermissaoCodigos.Todas)
        {
            if (!permissoes.TryGetValue(codigo, out var permissao))
                continue;

            resultado.Add(new CargoPermissaoModel
            {
                IdCargo = CargoModel.IdAdministrador,
                IdPermissao = permissao.Id,
                IdUnidadeEstoque = null,
            });
        }

        foreach (var unidadeId in new[] { Models.Estoque.UnidadeEstoqueIds.Secretaria, Models.Estoque.UnidadeEstoqueIds.Canil })
        {
            foreach (var codigo in new[]
                     {
                         PermissaoCodigos.EstoqueConsultar,
                         PermissaoCodigos.EstoqueEntrada,
                         PermissaoCodigos.EstoqueSaida,
                         PermissaoCodigos.EstoqueTransferirEnviar,
                         PermissaoCodigos.EstoqueTransferirReceber,
                     })
            {
                if (!permissoes.TryGetValue(codigo, out var permissao))
                    continue;

                resultado.Add(new CargoPermissaoModel
                {
                    IdCargo = CargoModel.IdAdministrador,
                    IdPermissao = permissao.Id,
                    IdUnidadeEstoque = unidadeId,
                });
            }
        }

        return resultado;
    }

    private static async Task AplicarPermissoesCargoAsync(
        CanilAppDbContext context,
        int idCargo,
        IReadOnlyList<CargoPermissaoModel> desejadas,
        CancellationToken cancellationToken)
    {
        var atuais = await context.CargosPermissoes
            .Where(a => a.IdCargo == idCargo)
            .ToListAsync(cancellationToken);

        var chavesDesejadas = desejadas
            .Select(a => Chave(a.IdPermissao, a.IdUnidadeEstoque))
            .ToHashSet();

        var remover = atuais
            .Where(a => !chavesDesejadas.Contains(Chave(a.IdPermissao, a.IdUnidadeEstoque)))
            .ToList();

        if (remover.Count > 0)
            context.CargosPermissoes.RemoveRange(remover);

        var chavesAtuais = atuais
            .Select(a => Chave(a.IdPermissao, a.IdUnidadeEstoque))
            .ToHashSet();

        foreach (var desejada in desejadas)
        {
            var chave = Chave(desejada.IdPermissao, desejada.IdUnidadeEstoque);
            if (chavesAtuais.Contains(chave))
                continue;

            context.CargosPermissoes.Add(new CargoPermissaoModel
            {
                IdCargo = idCargo,
                IdPermissao = desejada.IdPermissao,
                IdUnidadeEstoque = desejada.IdUnidadeEstoque,
            });
        }

        await context.SaveChangesAsync(cancellationToken);
    }

    private static string Chave(int idPermissao, int? idUnidade) =>
        $"{idPermissao}:{idUnidade?.ToString() ?? "global"}";
}
