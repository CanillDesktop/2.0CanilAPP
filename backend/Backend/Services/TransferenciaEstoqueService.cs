using Backend.Context;
using Backend.DTOs.Estoque;
using Backend.Exceptions;
using Backend.Models.Enums;
using Backend.Models.Estoque;
using Backend.Models.Produtos;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class TransferenciaEstoqueService : ITransferenciaEstoqueService
{
    private readonly CanilAppDbContext _context;
    private readonly IUserSessionService _userSession;
    private readonly IUnidadeEstoqueContextService _unidadeContext;

    public TransferenciaEstoqueService(
        CanilAppDbContext context,
        IUserSessionService userSession,
        IUnidadeEstoqueContextService unidadeContext)
    {
        _context = context;
        _userSession = userSession;
        _unidadeContext = unidadeContext;
    }

    public async Task<TransferenciaEstoqueLeituraDTO> CriarEEnviarAsync(
        TransferenciaEstoqueCriacaoDTO dto,
        CancellationToken cancellationToken = default)
    {
        if (dto.Itens.Count == 0)
            throw new ModelIncompletaException("Informe ao menos um item na transferência.");

        if (string.IsNullOrWhiteSpace(dto.ResponsavelEnvio))
            throw new ModelIncompletaException("Informe quem está realizando a transferência.");

        var idOrigem = await _unidadeContext.ObterUnidadeAtivaIdAsync(cancellationToken);
        await _unidadeContext.GarantirTransferenciaEnviarAsync(idOrigem, cancellationToken);

        var semDestino = !dto.IdUnidadeDestino.HasValue || dto.IdUnidadeDestino.Value <= 0;

        if (idOrigem == UnidadeEstoqueIds.Secretaria)
        {
            if (semDestino || dto.IdUnidadeDestino != UnidadeEstoqueIds.Canil)
                throw new RegraDeNegocioInfringidaException("Transferências da Secretaria devem ter destino no Canil.");
        }
        else if (idOrigem == UnidadeEstoqueIds.Canil)
        {
            if (semDestino && string.IsNullOrWhiteSpace(dto.Observacao))
                throw new ModelIncompletaException("Informe a observação quando não houver unidade de destino.");
        }
        else if (semDestino)
        {
            throw new RegraDeNegocioInfringidaException("Informe a unidade de destino.");
        }

        if (!semDestino && dto.IdUnidadeDestino == idOrigem)
            throw new RegraDeNegocioInfringidaException("Unidade de destino deve ser diferente da origem.");

        if (!semDestino)
        {
            var destinoExiste = await _context.UnidadesEstoque.AsNoTracking()
                .AnyAsync(u => u.Id == dto.IdUnidadeDestino && u.Ativa && !u.IsDeleted, cancellationToken);
            if (!destinoExiste)
                throw new RegraDeNegocioInfringidaException("Unidade de destino inválida.");
        }

        if (!int.TryParse(_userSession.UserId, out var idUsuario) || idUsuario <= 0)
            throw new AcessoNegadoException("Usuário não autenticado.");

        var now = DateTime.UtcNow;
        var editor = _userSession.EditedBy ?? string.Empty;
        var statusInicial = semDestino
            ? TransferenciaEstoqueStatusEnum.Recebida
            : TransferenciaEstoqueStatusEnum.Enviada;

        await using var tx = await _context.Database.BeginTransactionAsync(cancellationToken);

        var transferencia = new TransferenciaEstoqueModel
        {
            IdUnidadeOrigem = idOrigem,
            IdUnidadeDestino = semDestino ? null : dto.IdUnidadeDestino,
            DataTransferencia = now,
            IdUsuarioEnvio = idUsuario,
            Status = statusInicial,
            ResponsavelEnvio = dto.ResponsavelEnvio.Trim(),
            ResponsavelRecebimento = string.IsNullOrWhiteSpace(dto.ResponsavelRecebimento)
                ? null
                : dto.ResponsavelRecebimento.Trim(),
            Observacao = dto.Observacao,
            DataHoraCriacao = now,
            DataHoraAtualizacao = now,
            EditadorPor = editor,
        };

        _context.TransferenciasEstoque.Add(transferencia);
        await _context.SaveChangesAsync(cancellationToken);

        foreach (var itemDto in dto.Itens)
        {
            var loteOrigem = await _context.ItensEstoque
                .FirstOrDefaultAsync(e =>
                    e.Id == itemDto.IdItem
                    && e.Lote == itemDto.Lote
                    && e.IdUnidadeEstoque == idOrigem
                    && !e.IsDeleted, cancellationToken)
                ?? throw new RegraDeNegocioInfringidaException(
                    $"Lote {itemDto.Lote} não encontrado na unidade de origem.");

            if (loteOrigem.Quantidade < itemDto.Quantidade)
                throw new RegraDeNegocioInfringidaException(
                    $"Saldo insuficiente no lote {itemDto.Lote} para transferência.");

            var linhasBaixa = await _context.ItensEstoque
                .Where(e =>
                    e.Id == itemDto.IdItem
                    && e.Lote == itemDto.Lote
                    && e.IdUnidadeEstoque == idOrigem
                    && !e.IsDeleted
                    && e.Quantidade >= itemDto.Quantidade)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(e => e.Quantidade, e => e.Quantidade - itemDto.Quantidade)
                    .SetProperty(e => e.Versao, e => e.Versao + 1)
                    .SetProperty(e => e.DataHoraAtualizacao, _ => now)
                    .SetProperty(e => e.EditadorPor, _ => editor), cancellationToken);

            if (linhasBaixa != 1)
                throw new RegraDeNegocioInfringidaException("Falha ao baixar estoque na origem.");

            await _context.ItensEstoque
                .Where(e =>
                    e.Id == itemDto.IdItem
                    && e.Lote == itemDto.Lote
                    && e.IdUnidadeEstoque == idOrigem
                    && !e.IsDeleted
                    && e.Quantidade == 0)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(e => e.IsDeleted, _ => true)
                    .SetProperty(e => e.Versao, e => e.Versao + 1)
                    .SetProperty(e => e.DataHoraAtualizacao, _ => now)
                    .SetProperty(e => e.EditadorPor, _ => editor), cancellationToken);

            var saldoOrigemApos = loteOrigem.Quantidade - itemDto.Quantidade;

            var movSaida = new MovimentacaoEstoqueModel
            {
                IdUnidadeEstoque = idOrigem,
                IdItem = itemDto.IdItem,
                Lote = itemDto.Lote,
                Quantidade = -itemDto.Quantidade,
                SaldoAposMovimentacao = saldoOrigemApos,
                TipoMovimentacao = TipoMovimentacaoEstoqueEnum.TransferenciaSaida,
                IdTransferencia = transferencia.Id,
                IdUsuario = idUsuario,
                DataHoraMovimentacao = now,
                Observacao = dto.Observacao,
            };
            _context.MovimentacoesEstoque.Add(movSaida);

            var itemTransferencia = new TransferenciaEstoqueItemModel
            {
                IdTransferencia = transferencia.Id,
                IdItem = itemDto.IdItem,
                Lote = itemDto.Lote,
                Quantidade = itemDto.Quantidade,
            };
            _context.TransferenciasEstoqueItens.Add(itemTransferencia);
        }

        await _context.SaveChangesAsync(cancellationToken);
        await tx.CommitAsync(cancellationToken);

        return await MontarLeituraAsync(transferencia.Id, idOrigem, cancellationToken)
            ?? throw new RecursoNaoEncontradoException("Transferência não encontrada após criação.");
    }

    public async Task<TransferenciaEstoqueLeituraDTO> ConfirmarRecebimentoAsync(
        int idTransferencia,
        CancellationToken cancellationToken = default)
    {
        if (!int.TryParse(_userSession.UserId, out var idUsuario) || idUsuario <= 0)
            throw new AcessoNegadoException("Usuário não autenticado.");

        var transferencia = await _context.TransferenciasEstoque
            .Include(t => t.Itens)
            .FirstOrDefaultAsync(t => t.Id == idTransferencia && !t.IsDeleted, cancellationToken)
            ?? throw new RecursoNaoEncontradoException("Transferência não encontrada.");

        if (transferencia.Status != TransferenciaEstoqueStatusEnum.Enviada)
            throw new RegraDeNegocioInfringidaException("Somente transferências enviadas podem ser recebidas.");

        if (!transferencia.IdUnidadeDestino.HasValue)
            throw new RegraDeNegocioInfringidaException("Esta transferência não possui unidade de destino para recebimento.");

        var idUnidadeAtiva = await _unidadeContext.ObterUnidadeAtivaIdAsync(cancellationToken);
        if (idUnidadeAtiva != transferencia.IdUnidadeDestino)
        {
            throw new RegraDeNegocioInfringidaException(
                "Recebimento só pode ser confirmado na unidade de destino da transferência.");
        }

        await _unidadeContext.GarantirTransferenciaReceberAsync(transferencia.IdUnidadeDestino.Value, cancellationToken);

        var now = DateTime.UtcNow;
        var editor = _userSession.EditedBy ?? string.Empty;

        await using var tx = await _context.Database.BeginTransactionAsync(cancellationToken);

        foreach (var item in transferencia.Itens)
        {
            var loteDestino = await _context.ItensEstoque
                .FirstOrDefaultAsync(e =>
                    e.Id == item.IdItem
                    && e.Lote == item.Lote
                    && e.IdUnidadeEstoque == transferencia.IdUnidadeDestino!.Value
                    && !e.IsDeleted, cancellationToken);

            var codigo = await ObterCodigoItemAsync(item.IdItem, cancellationToken);

            int saldoApos;
            if (loteDestino is null)
            {
                saldoApos = item.Quantidade;
                _context.ItensEstoque.Add(new ItemEstoqueModel
                {
                    Id = item.IdItem,
                    IdUnidadeEstoque = transferencia.IdUnidadeDestino!.Value,
                    Codigo = codigo,
                    Lote = item.Lote,
                    Quantidade = item.Quantidade,
                    DataEntrega = now,
                    DataHoraCriacao = now,
                    DataHoraAtualizacao = now,
                    EditadorPor = editor,
                });
            }
            else
            {
                saldoApos = loteDestino.Quantidade + item.Quantidade;
                await _context.ItensEstoque
                    .Where(e =>
                        e.Id == item.IdItem
                        && e.Lote == item.Lote
                        && e.IdUnidadeEstoque == transferencia.IdUnidadeDestino!.Value
                        && !e.IsDeleted)
                    .ExecuteUpdateAsync(setters => setters
                        .SetProperty(e => e.Quantidade, e => e.Quantidade + item.Quantidade)
                        .SetProperty(e => e.Versao, e => e.Versao + 1)
                        .SetProperty(e => e.DataHoraAtualizacao, _ => now)
                        .SetProperty(e => e.EditadorPor, _ => editor), cancellationToken);
            }

            var movEntrada = new MovimentacaoEstoqueModel
            {
                IdUnidadeEstoque = transferencia.IdUnidadeDestino!.Value,
                IdItem = item.IdItem,
                Lote = item.Lote,
                Quantidade = item.Quantidade,
                SaldoAposMovimentacao = saldoApos,
                TipoMovimentacao = TipoMovimentacaoEstoqueEnum.TransferenciaEntrada,
                IdTransferencia = transferencia.Id,
                IdUsuario = idUsuario,
                DataHoraMovimentacao = now,
            };
            _context.MovimentacoesEstoque.Add(movEntrada);
        }

        transferencia.Status = TransferenciaEstoqueStatusEnum.Recebida;
        transferencia.IdUsuarioRecebimento = idUsuario;
        transferencia.DataHoraAtualizacao = now;
        transferencia.EditadorPor = editor;

        await _context.SaveChangesAsync(cancellationToken);
        await tx.CommitAsync(cancellationToken);

        return await MontarLeituraAsync(idTransferencia, idUnidadeAtiva, cancellationToken)
            ?? throw new RecursoNaoEncontradoException("Transferência não encontrada após recebimento.");
    }

    public async Task<IReadOnlyList<TransferenciaEstoqueLeituraDTO>> ListarAsync(CancellationToken cancellationToken = default)
    {
        var idUnidadeAtiva = await _unidadeContext.ObterUnidadeAtivaIdAsync(cancellationToken);
        await _unidadeContext.GarantirConsultaAsync(idUnidadeAtiva, cancellationToken);

        // Apenas transferências em que a unidade ativa é origem (saída) ou destino (entrada).
        var ids = await _context.TransferenciasEstoque.AsNoTracking()
            .Where(t => !t.IsDeleted
                && (t.IdUnidadeOrigem == idUnidadeAtiva
                    || (t.IdUnidadeDestino.HasValue && t.IdUnidadeDestino == idUnidadeAtiva)))
            .OrderByDescending(t => t.DataTransferencia)
            .Select(t => t.Id)
            .ToListAsync(cancellationToken);

        var resultado = new List<TransferenciaEstoqueLeituraDTO>();
        foreach (var id in ids)
        {
            var leitura = await MontarLeituraAsync(id, idUnidadeAtiva, cancellationToken);
            if (leitura is not null)
                resultado.Add(leitura);
        }

        return resultado;
    }

    private async Task<string> ObterCodigoItemAsync(int idItem, CancellationToken cancellationToken)
    {
        var produto = await _context.Produtos.AsNoTracking().FirstOrDefaultAsync(p => p.Id == idItem, cancellationToken);
        if (produto is not null) return produto.Codigo;

        var med = await _context.Medicamentos.AsNoTracking().FirstOrDefaultAsync(m => m.Id == idItem, cancellationToken);
        if (med is not null) return med.Codigo;

        var ins = await _context.Insumos.AsNoTracking().FirstOrDefaultAsync(i => i.Id == idItem, cancellationToken);
        if (ins is not null) return ins.Codigo;

        throw new RecursoNaoEncontradoException("Item da transferência não encontrado.");
    }

    private async Task<TransferenciaEstoqueLeituraDTO?> MontarLeituraAsync(
        int id,
        int idUnidadeAtiva,
        CancellationToken cancellationToken)
    {
        var t = await _context.TransferenciasEstoque.AsNoTracking()
            .Include(x => x.UnidadeOrigem)
            .Include(x => x.UnidadeDestino)
            .Include(x => x.UsuarioEnvio)
            .Include(x => x.UsuarioRecebimento)
            .Include(x => x.Itens)
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted, cancellationToken);

        if (t is null) return null;

        var itens = new List<TransferenciaEstoqueItemLeituraDTO>();
        foreach (var item in t.Itens)
        {
            var codigo = await ObterCodigoItemAsync(item.IdItem, cancellationToken);
            var nome = await ObterNomeItemAsync(item.IdItem, cancellationToken);
            itens.Add(new TransferenciaEstoqueItemLeituraDTO
            {
                IdItem = item.IdItem,
                Codigo = codigo,
                NomeItem = nome,
                Lote = item.Lote,
                Quantidade = item.Quantidade,
            });
        }

        var tipoMovimento = t.IdUnidadeOrigem == idUnidadeAtiva
            ? "Saida"
            : t.IdUnidadeDestino.HasValue && t.IdUnidadeDestino == idUnidadeAtiva
                ? "Entrada"
                : string.Empty;

        var nomeUsuarioEnvio = $"{t.UsuarioEnvio?.PrimeiroNome} {t.UsuarioEnvio?.Sobrenome}".Trim();
        var responsavelEnvio = string.IsNullOrWhiteSpace(t.ResponsavelEnvio) ? nomeUsuarioEnvio : t.ResponsavelEnvio.Trim();

        return new TransferenciaEstoqueLeituraDTO
        {
            Id = t.Id,
            IdUnidadeOrigem = t.IdUnidadeOrigem,
            UnidadeOrigemNome = t.UnidadeOrigem?.Nome ?? string.Empty,
            IdUnidadeDestino = t.IdUnidadeDestino,
            UnidadeDestinoNome = t.UnidadeDestino?.Nome ?? string.Empty,
            Status = t.Status.ToString().ToUpperInvariant(),
            TipoMovimento = tipoMovimento,
            DataTransferencia = t.DataTransferencia,
            UsuarioEnvio = nomeUsuarioEnvio,
            UsuarioRecebimento = t.UsuarioRecebimento is null
                ? null
                : $"{t.UsuarioRecebimento.PrimeiroNome} {t.UsuarioRecebimento.Sobrenome}".Trim(),
            ResponsavelEnvio = responsavelEnvio,
            ResponsavelRecebimento = t.ResponsavelRecebimento,
            Observacao = t.Observacao,
            Itens = itens,
        };
    }

    private async Task<string> ObterNomeItemAsync(int idItem, CancellationToken cancellationToken)
    {
        var produto = await _context.Produtos.AsNoTracking().FirstOrDefaultAsync(p => p.Id == idItem, cancellationToken);
        if (produto is not null) return produto.DescricaoSimples;

        var med = await _context.Medicamentos.AsNoTracking().FirstOrDefaultAsync(m => m.Id == idItem, cancellationToken);
        if (med is not null) return med.NomeComercial;

        var ins = await _context.Insumos.AsNoTracking().FirstOrDefaultAsync(i => i.Id == idItem, cancellationToken);
        if (ins is not null) return ins.DescricaoSimplificada;

        return string.Empty;
    }
}
