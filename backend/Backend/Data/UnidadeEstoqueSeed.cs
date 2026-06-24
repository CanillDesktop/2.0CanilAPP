using Backend.Context;
using Backend.Models.Enums;
using Backend.Models.Estoque;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public static class UnidadeEstoqueSeed
{
    public static async Task GarantirVinculosUsuariosAsync(CanilAppDbContext context)
    {
        var usuariosSemVinculo = await context.Usuarios
            .Where(u => u.Status != StatusUsuario.Excluido)
            .Where(u => !context.UsuariosUnidadesEstoque.Any(v => v.IdUsuario == u.Id))
            .ToListAsync();

        foreach (var usuario in usuariosSemVinculo)
        {
            var unidades = usuario.Permissao == PermissoesEnum.ADMIN
                ? new[] { UnidadeEstoqueIds.Secretaria, UnidadeEstoqueIds.Canil }
                : new[] { UnidadeEstoqueIds.Secretaria };

            foreach (var idUnidade in unidades)
            {
                context.UsuariosUnidadesEstoque.Add(new UsuarioUnidadeEstoqueModel
                {
                    IdUsuario = usuario.Id,
                    IdUnidadeEstoque = idUnidade,
                    PodeConsultar = true,
                    PodeEntrada = true,
                    PodeSaida = true,
                    PodeTransferirEnviar = true,
                    PodeTransferirReceber = idUnidade == UnidadeEstoqueIds.Canil || usuario.Permissao == PermissoesEnum.ADMIN,
                });
            }
        }

        if (usuariosSemVinculo.Count > 0)
            await context.SaveChangesAsync();
    }
}
