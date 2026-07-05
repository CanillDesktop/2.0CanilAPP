using Backend.Context;
using Backend.DTOs.Permissoes;
using Backend.Exceptions;
using Backend.Models.Permissoes;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class PermissaoCatalogoService : IPermissaoCatalogoService
{
    private readonly CanilAppDbContext _context;
    private readonly IPermissaoAuthorizationService _authorization;

    public PermissaoCatalogoService(
        CanilAppDbContext context,
        IPermissaoAuthorizationService authorization)
    {
        _context = context;
        _authorization = authorization;
    }

    public async Task<IReadOnlyList<PermissaoLeituraDTO>> ListarAsync(CancellationToken cancellationToken = default)
    {
        await _authorization.GarantirPermissaoAsync(PermissaoCodigos.PermissoesCatalogoVisualizar, cancellationToken: cancellationToken);

        return await _context.Permissoes.AsNoTracking()
            .Where(p => !p.IsDeleted)
            .OrderBy(p => p.Categoria)
            .ThenBy(p => p.Nome)
            .Select(p => new PermissaoLeituraDTO
            {
                Id = p.Id,
                Codigo = p.Codigo,
                Nome = p.Nome,
                Descricao = p.Descricao,
                Categoria = p.Categoria,
                EscopoUnidadeEstoque = p.EscopoUnidadeEstoque,
                EhSistema = p.EhSistema,
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<PermissaoLeituraDTO> CriarAsync(PermissaoCadastroDTO dto, CancellationToken cancellationToken = default)
    {
        await _authorization.GarantirPermissaoAsync(PermissaoCodigos.PermissoesCatalogoGerenciar, cancellationToken: cancellationToken);

        var codigo = NormalizarCodigo(dto.Codigo);
        if (string.IsNullOrWhiteSpace(codigo))
            throw new RegraDeNegocioInfringidaException("Informe um código para a permissão.");

        if (await _context.Permissoes.AnyAsync(p => p.Codigo == codigo && !p.IsDeleted, cancellationToken))
            throw new RegraDeNegocioInfringidaException("Já existe uma permissão com este código.");

        var agora = DateTime.UtcNow;
        var entidade = new PermissaoModel
        {
            Codigo = codigo,
            Nome = dto.Nome.Trim(),
            Descricao = string.IsNullOrWhiteSpace(dto.Descricao) ? null : dto.Descricao.Trim(),
            Categoria = string.IsNullOrWhiteSpace(dto.Categoria) ? "Personalizada" : dto.Categoria.Trim(),
            EscopoUnidadeEstoque = dto.EscopoUnidadeEstoque,
            EhSistema = false,
            DataHoraCriacao = agora,
            DataHoraAtualizacao = agora,
            EditadorPor = "CatalogoPermissoes",
        };

        _context.Permissoes.Add(entidade);
        await _context.SaveChangesAsync(cancellationToken);

        return Mapear(entidade);
    }

    public async Task<PermissaoLeituraDTO> AtualizarAsync(int id, PermissaoAtualizacaoDTO dto, CancellationToken cancellationToken = default)
    {
        await _authorization.GarantirPermissaoAsync(PermissaoCodigos.PermissoesCatalogoGerenciar, cancellationToken: cancellationToken);

        var entidade = await _context.Permissoes.FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted, cancellationToken)
            ?? throw new RecursoNaoEncontradoException("Permissão não encontrada.");

        entidade.Nome = dto.Nome.Trim();
        entidade.Descricao = string.IsNullOrWhiteSpace(dto.Descricao) ? null : dto.Descricao.Trim();
        entidade.Categoria = string.IsNullOrWhiteSpace(dto.Categoria) ? entidade.Categoria : dto.Categoria.Trim();
        entidade.DataHoraAtualizacao = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return Mapear(entidade);
    }

    public async Task ExcluirAsync(int id, CancellationToken cancellationToken = default)
    {
        await _authorization.GarantirPermissaoAsync(PermissaoCodigos.PermissoesCatalogoGerenciar, cancellationToken: cancellationToken);

        var entidade = await _context.Permissoes.FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted, cancellationToken)
            ?? throw new RecursoNaoEncontradoException("Permissão não encontrada.");

        if (entidade.EhSistema)
            throw new RegraDeNegocioInfringidaException("Permissões de sistema não podem ser excluídas.");

        var atribuicoes = await _context.UsuariosPermissoes.Where(a => a.IdPermissao == id).ToListAsync(cancellationToken);
        _context.UsuariosPermissoes.RemoveRange(atribuicoes);

        entidade.IsDeleted = true;
        entidade.DataHoraAtualizacao = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
    }

    private static PermissaoLeituraDTO Mapear(PermissaoModel entidade) => new()
    {
        Id = entidade.Id,
        Codigo = entidade.Codigo,
        Nome = entidade.Nome,
        Descricao = entidade.Descricao,
        Categoria = entidade.Categoria,
        EscopoUnidadeEstoque = entidade.EscopoUnidadeEstoque,
        EhSistema = entidade.EhSistema,
    };

    private static string NormalizarCodigo(string codigo) =>
        codigo.Trim().ToLowerInvariant().Replace(' ', '.');
}
