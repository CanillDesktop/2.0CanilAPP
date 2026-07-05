using Backend.Context;
using Backend.DTOs.Cargos;
using Backend.Exceptions;
using Backend.Models.Cargos;
using Backend.Models.Enums;
using Backend.Models.Permissoes;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class CargoService : ICargoService
{
    private readonly CanilAppDbContext _context;
    private readonly IPermissaoAuthorizationService _authorization;

    public CargoService(CanilAppDbContext context, IPermissaoAuthorizationService authorization)
    {
        _context = context;
        _authorization = authorization;
    }

    public async Task<IReadOnlyList<CargoLeituraDTO>> ListarAsync(CancellationToken cancellationToken = default)
    {
        await GarantirPodeVisualizarAsync(cancellationToken);

        var cargos = await _context.Cargos.AsNoTracking()
            .Where(c => !c.IsDeleted)
            .OrderBy(c => c.EhSistema ? 0 : 1)
            .ThenBy(c => c.Nome)
            .ToListAsync(cancellationToken);

        var contagem = await _context.Usuarios.AsNoTracking()
            .Where(u => u.Status != StatusUsuario.Excluido)
            .GroupBy(u => u.IdCargo)
            .Select(g => new { IdCargo = g.Key, Total = g.Count() })
            .ToDictionaryAsync(x => x.IdCargo, x => x.Total, cancellationToken);

        return cargos.Select(c => new CargoLeituraDTO
        {
            Id = c.Id,
            Nome = c.Nome,
            Descricao = c.Descricao,
            EhAdministradorSistema = c.EhAdministradorSistema,
            EhSistema = c.EhSistema,
            TotalUsuarios = contagem.GetValueOrDefault(c.Id),
        }).ToList();
    }

    public async Task<CargoLeituraDTO> CriarAsync(CargoCadastroDTO dto, CancellationToken cancellationToken = default)
    {
        await _authorization.GarantirPermissaoAsync(PermissaoCodigos.CargosGerenciar, cancellationToken: cancellationToken);

        var nome = (dto.Nome ?? string.Empty).Trim();
        if (nome.Length < 2)
            throw new RegraDeNegocioInfringidaException("Informe um nome de cargo com pelo menos 2 caracteres.");

        if (await _context.Cargos.AnyAsync(c => !c.IsDeleted && c.Nome.ToLower() == nome.ToLower(), cancellationToken))
            throw new RegraDeNegocioInfringidaException("Já existe um cargo com este nome.");

        var agora = DateTime.UtcNow;
        var cargo = new CargoModel
        {
            Nome = nome,
            Descricao = string.IsNullOrWhiteSpace(dto.Descricao) ? null : dto.Descricao.Trim(),
            EhAdministradorSistema = false,
            EhSistema = false,
            DataHoraCriacao = agora,
            DataHoraAtualizacao = agora,
            EditadorPor = "Sistema",
        };

        _context.Cargos.Add(cargo);
        await _context.SaveChangesAsync(cancellationToken);

        return new CargoLeituraDTO
        {
            Id = cargo.Id,
            Nome = cargo.Nome,
            Descricao = cargo.Descricao,
            EhAdministradorSistema = cargo.EhAdministradorSistema,
            EhSistema = cargo.EhSistema,
            TotalUsuarios = 0,
        };
    }

    public async Task<CargoLeituraDTO> AtualizarAsync(int id, CargoAtualizacaoDTO dto, CancellationToken cancellationToken = default)
    {
        await _authorization.GarantirPermissaoAsync(PermissaoCodigos.CargosGerenciar, cancellationToken: cancellationToken);

        var cargo = await _context.Cargos.FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted, cancellationToken)
            ?? throw new RecursoNaoEncontradoException("Cargo não encontrado.");

        var nome = (dto.Nome ?? string.Empty).Trim();
        if (nome.Length < 2)
            throw new RegraDeNegocioInfringidaException("Informe um nome de cargo com pelo menos 2 caracteres.");

        if (await _context.Cargos.AnyAsync(
                c => !c.IsDeleted && c.Id != id && c.Nome.ToLower() == nome.ToLower(),
                cancellationToken))
            throw new RegraDeNegocioInfringidaException("Já existe um cargo com este nome.");

        cargo.Nome = nome;
        cargo.Descricao = string.IsNullOrWhiteSpace(dto.Descricao) ? null : dto.Descricao.Trim();
        cargo.DataHoraAtualizacao = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        var total = await _context.Usuarios.CountAsync(
            u => u.IdCargo == id && u.Status != StatusUsuario.Excluido,
            cancellationToken);

        return new CargoLeituraDTO
        {
            Id = cargo.Id,
            Nome = cargo.Nome,
            Descricao = cargo.Descricao,
            EhAdministradorSistema = cargo.EhAdministradorSistema,
            EhSistema = cargo.EhSistema,
            TotalUsuarios = total,
        };
    }

    public async Task ExcluirAsync(int id, CancellationToken cancellationToken = default)
    {
        await _authorization.GarantirPermissaoAsync(PermissaoCodigos.CargosGerenciar, cancellationToken: cancellationToken);

        var cargo = await _context.Cargos.FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted, cancellationToken)
            ?? throw new RecursoNaoEncontradoException("Cargo não encontrado.");

        if (cargo.EhSistema)
            throw new RegraDeNegocioInfringidaException("Cargos padrão do sistema não podem ser excluídos.");

        if (cargo.EhAdministradorSistema)
            throw new RegraDeNegocioInfringidaException("O cargo de administrador não pode ser excluído.");

        var usuarios = await _context.Usuarios.CountAsync(
            u => u.IdCargo == id && u.Status != StatusUsuario.Excluido,
            cancellationToken);

        if (usuarios > 0)
            throw new RegraDeNegocioInfringidaException("Não é possível excluir um cargo com usuários vinculados.");

        cargo.IsDeleted = true;
        cargo.DataHoraAtualizacao = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
    }

    private async Task GarantirPodeVisualizarAsync(CancellationToken cancellationToken)
    {
        var podeGerenciar = await _authorization.PossuiPermissaoAsync(
            PermissaoCodigos.CargosGerenciar,
            cancellationToken: cancellationToken);

        var podeListarUsuarios = await _authorization.PossuiPermissaoAsync(
            PermissaoCodigos.UsuariosListar,
            cancellationToken: cancellationToken);

        if (!podeGerenciar && !podeListarUsuarios)
            throw new AcessoNegadoException("Sem permissão para consultar cargos.");
    }
}
