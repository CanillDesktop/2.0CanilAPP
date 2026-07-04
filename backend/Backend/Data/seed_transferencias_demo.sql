-- =============================================================================
-- 4 transferências demo (rode sobre o seed de estoque já aplicado)
-- Status: Enviada=2, Recebida=3
-- TipoMovimentacao: TransferenciaSaida=3, TransferenciaEntrada=4
-- =============================================================================

PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;

DELETE FROM TransferenciasEstoqueItens;
DELETE FROM MovimentacoesEstoque WHERE TipoMovimentacao IN (3, 4);
DELETE FROM TransferenciasEstoque;

-- Restaura saldos de origem caso o script seja reexecutado
UPDATE ItensEstoque SET Quantidade = 65, Versao = Versao + 1
WHERE Id = 1 AND IdUnidadeEstoque = 1 AND Lote = 'PROALRAC000001';
UPDATE ItensEstoque SET Quantidade = 80, Versao = Versao + 1
WHERE Id = 7 AND IdUnidadeEstoque = 2 AND Lote = 'PROALRAC000016';
UPDATE ItensEstoque SET Quantidade = 80, Versao = Versao + 1
WHERE Id = 13 AND IdUnidadeEstoque = 1 AND Lote = 'MEDABAC000001';
UPDATE ItensEstoque SET Quantidade = 90, Versao = Versao + 1
WHERE Id = 18 AND IdUnidadeEstoque = 2 AND Lote = 'MEDAVER000011';

-- Remove lotes criados no destino por transferências recebidas anteriores
DELETE FROM ItensEstoque
WHERE (Id = 1 AND IdUnidadeEstoque = 2 AND Lote = 'PROALRAC000001')
   OR (Id = 7 AND IdUnidadeEstoque = 1 AND Lote = 'PROALRAC000016');

DELETE FROM sqlite_sequence WHERE name IN ('TransferenciasEstoque', 'TransferenciasEstoqueItens');

-- ---------------------------------------------------------------------------
-- 1) Recebida: Secretaria -> Canil (ração adulto)
-- ---------------------------------------------------------------------------
INSERT INTO TransferenciasEstoque (
    Id, IdUnidadeOrigem, IdUnidadeDestino, DataTransferencia,
    IdUsuarioEnvio, IdUsuarioRecebimento, IdUsuarioAprovacao, Status, Observacao,
    DataHoraCriacao, DataHoraAtualizacao, EditadorPor, IsDeleted
) VALUES (
    1, 1, 2, '2026-06-15 10:00:00',
    1, 5, NULL, 3, 'Reposição de ração no canil',
    '2026-06-15 10:00:00', '2026-06-15 10:00:00', 'Sistema', 0
);

UPDATE ItensEstoque
SET Quantidade = 55, Versao = Versao + 1, DataHoraAtualizacao = '2026-06-15 10:00:00', EditadorPor = 'Sistema'
WHERE Id = 1 AND IdUnidadeEstoque = 1 AND Lote = 'PROALRAC000001';

INSERT INTO MovimentacoesEstoque (
    IdUnidadeEstoque, IdItem, Lote, Quantidade, SaldoAposMovimentacao,
    TipoMovimentacao, OrigemMovimentacao, IdTransferencia, IdRetirada, IdUsuario,
    DataHoraMovimentacao, Observacao, NFe, FornecedorNome, FornecedorDocumento, DoadorNome, DoadorDocumento
) VALUES (
    1, 1, 'PROALRAC000001', -10, 55,
    3, NULL, 1, NULL, 1,
    '2026-06-15 10:00:00', 'Reposição de ração no canil', NULL, NULL, NULL, NULL, NULL
);

INSERT INTO ItensEstoque (
    Id, IdUnidadeEstoque, Lote, Codigo, DataEntrega, DataHoraAtualizacao, DataHoraCriacao,
    DataValidade, EditadorPor, IsDeleted, NFe, Quantidade, Versao
) VALUES (
    1, 2, 'PROALRAC000001', 'PRDALI0001', '2026-06-15 10:00:00', '2026-06-15 10:00:00', '2026-06-15 10:00:00',
    NULL, 'Sistema', 0, NULL, 10, 1
);

INSERT INTO MovimentacoesEstoque (
    IdUnidadeEstoque, IdItem, Lote, Quantidade, SaldoAposMovimentacao,
    TipoMovimentacao, OrigemMovimentacao, IdTransferencia, IdRetirada, IdUsuario,
    DataHoraMovimentacao, Observacao, NFe, FornecedorNome, FornecedorDocumento, DoadorNome, DoadorDocumento
) VALUES (
    2, 1, 'PROALRAC000001', 10, 10,
    4, NULL, 1, NULL, 5,
    '2026-06-15 10:00:00', 'Reposição de ração no canil', NULL, NULL, NULL, NULL, NULL
);

INSERT INTO TransferenciasEstoqueItens (
    IdTransferencia, IdItem, Lote, Quantidade, ValorUnitario, IdMovimentacaoSaida, IdMovimentacaoEntrada
) VALUES (
    1, 1, 'PROALRAC000001', 10, NULL,
    (SELECT Id FROM MovimentacoesEstoque WHERE IdTransferencia = 1 AND TipoMovimentacao = 3 LIMIT 1),
    (SELECT Id FROM MovimentacoesEstoque WHERE IdTransferencia = 1 AND TipoMovimentacao = 4 LIMIT 1)
);

-- ---------------------------------------------------------------------------
-- 2) Recebida: Canil -> Secretaria (ração filhote)
-- ---------------------------------------------------------------------------
INSERT INTO TransferenciasEstoque (
    Id, IdUnidadeOrigem, IdUnidadeDestino, DataTransferencia,
    IdUsuarioEnvio, IdUsuarioRecebimento, IdUsuarioAprovacao, Status, Observacao,
    DataHoraCriacao, DataHoraAtualizacao, EditadorPor, IsDeleted
) VALUES (
    2, 2, 1, '2026-06-18 14:30:00',
    1, 2, NULL, 3, 'Devolução de excedente ao estoque da secretaria',
    '2026-06-18 14:30:00', '2026-06-18 14:30:00', 'Sistema', 0
);

UPDATE ItensEstoque
SET Quantidade = 65, Versao = Versao + 1, DataHoraAtualizacao = '2026-06-18 14:30:00', EditadorPor = 'Sistema'
WHERE Id = 7 AND IdUnidadeEstoque = 2 AND Lote = 'PROALRAC000016';

INSERT INTO MovimentacoesEstoque (
    IdUnidadeEstoque, IdItem, Lote, Quantidade, SaldoAposMovimentacao,
    TipoMovimentacao, OrigemMovimentacao, IdTransferencia, IdRetirada, IdUsuario,
    DataHoraMovimentacao, Observacao, NFe, FornecedorNome, FornecedorDocumento, DoadorNome, DoadorDocumento
) VALUES (
    2, 7, 'PROALRAC000016', -15, 65,
    3, NULL, 2, NULL, 1,
    '2026-06-18 14:30:00', 'Devolução de excedente ao estoque da secretaria', NULL, NULL, NULL, NULL, NULL
);

INSERT INTO ItensEstoque (
    Id, IdUnidadeEstoque, Lote, Codigo, DataEntrega, DataHoraAtualizacao, DataHoraCriacao,
    DataValidade, EditadorPor, IsDeleted, NFe, Quantidade, Versao
) VALUES (
    7, 1, 'PROALRAC000016', 'PRDALI0007', '2026-06-18 14:30:00', '2026-06-18 14:30:00', '2026-06-18 14:30:00',
    NULL, 'Sistema', 0, NULL, 15, 1
);

INSERT INTO MovimentacoesEstoque (
    IdUnidadeEstoque, IdItem, Lote, Quantidade, SaldoAposMovimentacao,
    TipoMovimentacao, OrigemMovimentacao, IdTransferencia, IdRetirada, IdUsuario,
    DataHoraMovimentacao, Observacao, NFe, FornecedorNome, FornecedorDocumento, DoadorNome, DoadorDocumento
) VALUES (
    1, 7, 'PROALRAC000016', 15, 15,
    4, NULL, 2, NULL, 2,
    '2026-06-18 14:30:00', 'Devolução de excedente ao estoque da secretaria', NULL, NULL, NULL, NULL, NULL
);

INSERT INTO TransferenciasEstoqueItens (
    IdTransferencia, IdItem, Lote, Quantidade, ValorUnitario, IdMovimentacaoSaida, IdMovimentacaoEntrada
) VALUES (
    2, 7, 'PROALRAC000016', 15, NULL,
    (SELECT Id FROM MovimentacoesEstoque WHERE IdTransferencia = 2 AND TipoMovimentacao = 3 LIMIT 1),
    (SELECT Id FROM MovimentacoesEstoque WHERE IdTransferencia = 2 AND TipoMovimentacao = 4 LIMIT 1)
);

-- ---------------------------------------------------------------------------
-- 3) Enviada (pendente): Secretaria -> Canil (BactoPet)
-- ---------------------------------------------------------------------------
INSERT INTO TransferenciasEstoque (
    Id, IdUnidadeOrigem, IdUnidadeDestino, DataTransferencia,
    IdUsuarioEnvio, IdUsuarioRecebimento, IdUsuarioAprovacao, Status, Observacao,
    DataHoraCriacao, DataHoraAtualizacao, EditadorPor, IsDeleted
) VALUES (
    3, 1, 2, '2026-07-01 09:00:00',
    1, NULL, NULL, 2, 'Envio de antibiótico para uso no canil',
    '2026-07-01 09:00:00', '2026-07-01 09:00:00', 'Sistema', 0
);

UPDATE ItensEstoque
SET Quantidade = 75, Versao = Versao + 1, DataHoraAtualizacao = '2026-07-01 09:00:00', EditadorPor = 'Sistema'
WHERE Id = 13 AND IdUnidadeEstoque = 1 AND Lote = 'MEDABAC000001';

INSERT INTO MovimentacoesEstoque (
    IdUnidadeEstoque, IdItem, Lote, Quantidade, SaldoAposMovimentacao,
    TipoMovimentacao, OrigemMovimentacao, IdTransferencia, IdRetirada, IdUsuario,
    DataHoraMovimentacao, Observacao, NFe, FornecedorNome, FornecedorDocumento, DoadorNome, DoadorDocumento
) VALUES (
    1, 13, 'MEDABAC000001', -5, 75,
    3, NULL, 3, NULL, 1,
    '2026-07-01 09:00:00', 'Envio de antibiótico para uso no canil', NULL, NULL, NULL, NULL, NULL
);

INSERT INTO TransferenciasEstoqueItens (
    IdTransferencia, IdItem, Lote, Quantidade, ValorUnitario, IdMovimentacaoSaida, IdMovimentacaoEntrada
) VALUES (
    3, 13, 'MEDABAC000001', 5, NULL,
    (SELECT Id FROM MovimentacoesEstoque WHERE IdTransferencia = 3 AND TipoMovimentacao = 3 LIMIT 1),
    NULL
);

-- ---------------------------------------------------------------------------
-- 4) Enviada (pendente): Canil -> Secretaria (VermiGuard)
-- ---------------------------------------------------------------------------
INSERT INTO TransferenciasEstoque (
    Id, IdUnidadeOrigem, IdUnidadeDestino, DataTransferencia,
    IdUsuarioEnvio, IdUsuarioRecebimento, IdUsuarioAprovacao, Status, Observacao,
    DataHoraCriacao, DataHoraAtualizacao, EditadorPor, IsDeleted
) VALUES (
    4, 2, 1, '2026-07-02 11:20:00',
    1, NULL, NULL, 2, 'Transferência de vermífugo para a secretaria',
    '2026-07-02 11:20:00', '2026-07-02 11:20:00', 'Sistema', 0
);

UPDATE ItensEstoque
SET Quantidade = 82, Versao = Versao + 1, DataHoraAtualizacao = '2026-07-02 11:20:00', EditadorPor = 'Sistema'
WHERE Id = 18 AND IdUnidadeEstoque = 2 AND Lote = 'MEDAVER000011';

INSERT INTO MovimentacoesEstoque (
    IdUnidadeEstoque, IdItem, Lote, Quantidade, SaldoAposMovimentacao,
    TipoMovimentacao, OrigemMovimentacao, IdTransferencia, IdRetirada, IdUsuario,
    DataHoraMovimentacao, Observacao, NFe, FornecedorNome, FornecedorDocumento, DoadorNome, DoadorDocumento
) VALUES (
    2, 18, 'MEDAVER000011', -8, 82,
    3, NULL, 4, NULL, 1,
    '2026-07-02 11:20:00', 'Transferência de vermífugo para a secretaria', NULL, NULL, NULL, NULL, NULL
);

INSERT INTO TransferenciasEstoqueItens (
    IdTransferencia, IdItem, Lote, Quantidade, ValorUnitario, IdMovimentacaoSaida, IdMovimentacaoEntrada
) VALUES (
    4, 18, 'MEDAVER000011', 8, NULL,
    (SELECT Id FROM MovimentacoesEstoque WHERE IdTransferencia = 4 AND TipoMovimentacao = 3 LIMIT 1),
    NULL
);

COMMIT;
PRAGMA foreign_keys = ON;

-- SELECT Id, IdUnidadeOrigem, IdUnidadeDestino, Status, Observacao FROM TransferenciasEstoque;
-- SELECT * FROM TransferenciasEstoqueItens;
