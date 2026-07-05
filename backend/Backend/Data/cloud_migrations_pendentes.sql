BEGIN TRANSACTION;

UPDATE ItensEstoque
SET Codigo = (
    SELECT Codigo FROM Produtos WHERE Produtos.Id = ItensEstoque.Id
)
WHERE (Codigo IS NULL OR Codigo = '')
  AND EXISTS (SELECT 1 FROM Produtos WHERE Produtos.Id = ItensEstoque.Id);

UPDATE ItensEstoque
SET Codigo = (
    SELECT Codigo FROM Medicamentos WHERE Medicamentos.Id = ItensEstoque.Id
)
WHERE (Codigo IS NULL OR Codigo = '')
  AND EXISTS (SELECT 1 FROM Medicamentos WHERE Medicamentos.Id = ItensEstoque.Id);

UPDATE ItensEstoque
SET Codigo = (
    SELECT Codigo FROM Insumos WHERE Insumos.Id = ItensEstoque.Id
)
WHERE (Codigo IS NULL OR Codigo = '')
  AND EXISTS (SELECT 1 FROM Insumos WHERE Insumos.Id = ItensEstoque.Id);

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260617231425_BackfillItensEstoqueCodigo', '8.0.11');

COMMIT;

BEGIN TRANSACTION;

ALTER TABLE "Usuarios" ADD "DeletedAt" TEXT NULL;

ALTER TABLE "Usuarios" ADD "DeletedBy" TEXT NULL;

ALTER TABLE "Usuarios" ADD "InactivatedAt" TEXT NULL;

ALTER TABLE "Usuarios" ADD "InactivatedBy" TEXT NULL;

ALTER TABLE "Usuarios" ADD "ReactivatedAt" TEXT NULL;

ALTER TABLE "Usuarios" ADD "ReactivatedBy" TEXT NULL;

ALTER TABLE "Usuarios" ADD "Status" INTEGER NOT NULL DEFAULT 1;

ALTER TABLE "Usuarios" ADD "TokenVersion" INTEGER NOT NULL DEFAULT 1;

CREATE INDEX "IX_Usuarios_Status" ON "Usuarios" ("Status");

UPDATE Usuarios SET Status = 2, TokenVersion = 1 WHERE IsDeleted = 1;
UPDATE Usuarios SET Status = 1, TokenVersion = 1 WHERE IsDeleted = 0;

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260624004809_UsuarioStatusAuditoriaTokenVersion', '8.0.11');

COMMIT;

BEGIN TRANSACTION;

DROP INDEX "IX_Usuarios_Status";

DROP INDEX "IX_ItensEstoque_Lote";

ALTER TABLE "RetiradaEstoque" ADD "IdMovimentacao" INTEGER NULL;

ALTER TABLE "RetiradaEstoque" ADD "IdUnidadeEstoque" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "ItensNivelEstoque" ADD "IdUnidadeEstoque" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "ItensEstoque" ADD "IdUnidadeEstoque" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "UnidadesEstoque" (
    "Id" INTEGER NOT NULL CONSTRAINT "PK_UnidadesEstoque" PRIMARY KEY AUTOINCREMENT,
    "Nome" TEXT NOT NULL,
    "Sigla" TEXT NOT NULL,
    "Tipo" TEXT NOT NULL,
    "Ativa" INTEGER NOT NULL,
    "DataCadastro" TEXT NOT NULL,
    "DataHoraCriacao" TEXT NOT NULL,
    "DataHoraAtualizacao" TEXT NOT NULL,
    "EditadorPor" TEXT NOT NULL,
    "IsDeleted" INTEGER NOT NULL
);

CREATE TABLE "TransferenciasEstoque" (
    "Id" INTEGER NOT NULL CONSTRAINT "PK_TransferenciasEstoque" PRIMARY KEY AUTOINCREMENT,
    "IdUnidadeOrigem" INTEGER NOT NULL,
    "IdUnidadeDestino" INTEGER NOT NULL,
    "DataTransferencia" TEXT NOT NULL,
    "IdUsuarioEnvio" INTEGER NOT NULL,
    "IdUsuarioRecebimento" INTEGER NULL,
    "IdUsuarioAprovacao" INTEGER NULL,
    "Status" INTEGER NOT NULL,
    "Observacao" TEXT NULL,
    "DataHoraCriacao" TEXT NOT NULL,
    "DataHoraAtualizacao" TEXT NOT NULL,
    "EditadorPor" TEXT NOT NULL,
    "IsDeleted" INTEGER NOT NULL,
    CONSTRAINT "FK_TransferenciasEstoque_UnidadesEstoque_IdUnidadeDestino" FOREIGN KEY ("IdUnidadeDestino") REFERENCES "UnidadesEstoque" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_TransferenciasEstoque_UnidadesEstoque_IdUnidadeOrigem" FOREIGN KEY ("IdUnidadeOrigem") REFERENCES "UnidadesEstoque" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_TransferenciasEstoque_Usuarios_IdUsuarioEnvio" FOREIGN KEY ("IdUsuarioEnvio") REFERENCES "Usuarios" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_TransferenciasEstoque_Usuarios_IdUsuarioRecebimento" FOREIGN KEY ("IdUsuarioRecebimento") REFERENCES "Usuarios" ("Id")
);

CREATE TABLE "UsuariosUnidadesEstoque" (
    "IdUsuario" INTEGER NOT NULL,
    "IdUnidadeEstoque" INTEGER NOT NULL,
    "PodeConsultar" INTEGER NOT NULL,
    "PodeEntrada" INTEGER NOT NULL,
    "PodeSaida" INTEGER NOT NULL,
    "PodeTransferirEnviar" INTEGER NOT NULL,
    "PodeTransferirReceber" INTEGER NOT NULL,
    CONSTRAINT "PK_UsuariosUnidadesEstoque" PRIMARY KEY ("IdUsuario", "IdUnidadeEstoque"),
    CONSTRAINT "FK_UsuariosUnidadesEstoque_UnidadesEstoque_IdUnidadeEstoque" FOREIGN KEY ("IdUnidadeEstoque") REFERENCES "UnidadesEstoque" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_UsuariosUnidadesEstoque_Usuarios_IdUsuario" FOREIGN KEY ("IdUsuario") REFERENCES "Usuarios" ("Id") ON DELETE CASCADE
);

CREATE TABLE "MovimentacoesEstoque" (
    "Id" INTEGER NOT NULL CONSTRAINT "PK_MovimentacoesEstoque" PRIMARY KEY AUTOINCREMENT,
    "IdUnidadeEstoque" INTEGER NOT NULL,
    "IdItem" INTEGER NOT NULL,
    "Lote" TEXT NOT NULL,
    "Quantidade" INTEGER NOT NULL,
    "SaldoAposMovimentacao" INTEGER NOT NULL,
    "TipoMovimentacao" INTEGER NOT NULL,
    "OrigemMovimentacao" TEXT NULL,
    "IdTransferencia" INTEGER NULL,
    "IdRetirada" INTEGER NULL,
    "IdUsuario" INTEGER NOT NULL,
    "DataHoraMovimentacao" TEXT NOT NULL,
    "Observacao" TEXT NULL,
    "NFe" TEXT NULL,
    "FornecedorNome" TEXT NULL,
    "FornecedorDocumento" TEXT NULL,
    "DoadorNome" TEXT NULL,
    "DoadorDocumento" TEXT NULL,
    "RetiradaId" INTEGER NULL,
    CONSTRAINT "FK_MovimentacoesEstoque_ItensBase_IdItem" FOREIGN KEY ("IdItem") REFERENCES "ItensBase" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_MovimentacoesEstoque_RetiradaEstoque_RetiradaId" FOREIGN KEY ("RetiradaId") REFERENCES "RetiradaEstoque" ("Id"),
    CONSTRAINT "FK_MovimentacoesEstoque_TransferenciasEstoque_IdTransferencia" FOREIGN KEY ("IdTransferencia") REFERENCES "TransferenciasEstoque" ("Id"),
    CONSTRAINT "FK_MovimentacoesEstoque_UnidadesEstoque_IdUnidadeEstoque" FOREIGN KEY ("IdUnidadeEstoque") REFERENCES "UnidadesEstoque" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_MovimentacoesEstoque_Usuarios_IdUsuario" FOREIGN KEY ("IdUsuario") REFERENCES "Usuarios" ("Id") ON DELETE CASCADE
);

CREATE TABLE "TransferenciasEstoqueItens" (
    "Id" INTEGER NOT NULL CONSTRAINT "PK_TransferenciasEstoqueItens" PRIMARY KEY AUTOINCREMENT,
    "IdTransferencia" INTEGER NOT NULL,
    "IdItem" INTEGER NOT NULL,
    "Lote" TEXT NOT NULL,
    "Quantidade" INTEGER NOT NULL,
    "ValorUnitario" TEXT NULL,
    "IdMovimentacaoSaida" INTEGER NULL,
    "IdMovimentacaoEntrada" INTEGER NULL,
    CONSTRAINT "FK_TransferenciasEstoqueItens_ItensBase_IdItem" FOREIGN KEY ("IdItem") REFERENCES "ItensBase" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_TransferenciasEstoqueItens_TransferenciasEstoque_IdTransferencia" FOREIGN KEY ("IdTransferencia") REFERENCES "TransferenciasEstoque" ("Id") ON DELETE CASCADE
);

INSERT INTO "UnidadesEstoque" ("Id", "Ativa", "DataCadastro", "DataHoraAtualizacao", "DataHoraCriacao", "EditadorPor", "IsDeleted", "Nome", "Sigla", "Tipo")
VALUES (1, 1, '2026-01-01 00:00:00', '2026-01-01 00:00:00', '2026-01-01 00:00:00', 'Sistema', 0, 'Secretaria', 'SEC', 'ADMINISTRATIVO');
SELECT changes();

INSERT INTO "UnidadesEstoque" ("Id", "Ativa", "DataCadastro", "DataHoraAtualizacao", "DataHoraCriacao", "EditadorPor", "IsDeleted", "Nome", "Sigla", "Tipo")
VALUES (2, 1, '2026-01-01 00:00:00', '2026-01-01 00:00:00', '2026-01-01 00:00:00', 'Sistema', 0, 'Canil', 'CAN', 'OPERACIONAL');
SELECT changes();


UPDATE ItensEstoque SET IdUnidadeEstoque = 1 WHERE IdUnidadeEstoque = 0;

UPDATE ItensNivelEstoque SET IdUnidadeEstoque = 1 WHERE IdUnidadeEstoque = 0;

UPDATE RetiradaEstoque SET IdUnidadeEstoque = 1 WHERE IdUnidadeEstoque = 0;

CREATE INDEX "IX_RetiradaEstoque_IdUnidadeEstoque_DataHoraRetirada" ON "RetiradaEstoque" ("IdUnidadeEstoque", "DataHoraRetirada");

CREATE INDEX "IX_ItensNivelEstoque_IdUnidadeEstoque" ON "ItensNivelEstoque" ("IdUnidadeEstoque");

CREATE INDEX "IX_ItensEstoque_IdUnidadeEstoque" ON "ItensEstoque" ("IdUnidadeEstoque");

CREATE UNIQUE INDEX "IX_ItensEstoque_IdUnidadeEstoque_Lote" ON "ItensEstoque" ("IdUnidadeEstoque", "Lote");

CREATE INDEX "IX_MovimentacoesEstoque_IdItem_Lote" ON "MovimentacoesEstoque" ("IdItem", "Lote");

CREATE INDEX "IX_MovimentacoesEstoque_IdTransferencia" ON "MovimentacoesEstoque" ("IdTransferencia");

CREATE INDEX "IX_MovimentacoesEstoque_IdUnidadeEstoque_DataHoraMovimentacao" ON "MovimentacoesEstoque" ("IdUnidadeEstoque", "DataHoraMovimentacao");

CREATE INDEX "IX_MovimentacoesEstoque_IdUsuario" ON "MovimentacoesEstoque" ("IdUsuario");

CREATE INDEX "IX_MovimentacoesEstoque_RetiradaId" ON "MovimentacoesEstoque" ("RetiradaId");

CREATE INDEX "IX_TransferenciasEstoque_IdUnidadeDestino" ON "TransferenciasEstoque" ("IdUnidadeDestino");

CREATE INDEX "IX_TransferenciasEstoque_IdUnidadeOrigem_IdUnidadeDestino_DataTransferencia" ON "TransferenciasEstoque" ("IdUnidadeOrigem", "IdUnidadeDestino", "DataTransferencia");

CREATE INDEX "IX_TransferenciasEstoque_IdUsuarioEnvio" ON "TransferenciasEstoque" ("IdUsuarioEnvio");

CREATE INDEX "IX_TransferenciasEstoque_IdUsuarioRecebimento" ON "TransferenciasEstoque" ("IdUsuarioRecebimento");

CREATE INDEX "IX_TransferenciasEstoque_Status" ON "TransferenciasEstoque" ("Status");

CREATE INDEX "IX_TransferenciasEstoqueItens_IdItem" ON "TransferenciasEstoqueItens" ("IdItem");

CREATE INDEX "IX_TransferenciasEstoqueItens_IdTransferencia" ON "TransferenciasEstoqueItens" ("IdTransferencia");

CREATE UNIQUE INDEX "IX_UnidadesEstoque_Sigla" ON "UnidadesEstoque" ("Sigla");

CREATE INDEX "IX_UsuariosUnidadesEstoque_IdUnidadeEstoque" ON "UsuariosUnidadesEstoque" ("IdUnidadeEstoque");

CREATE TABLE "ef_temp_ItensNivelEstoque" (
    "Id" INTEGER NOT NULL,
    "IdUnidadeEstoque" INTEGER NOT NULL,
    "DataHoraAtualizacao" TEXT NOT NULL,
    "DataHoraCriacao" TEXT NOT NULL,
    "EditadorPor" TEXT NOT NULL,
    "IsDeleted" INTEGER NOT NULL,
    "NivelMinimoEstoque" INTEGER NOT NULL,
    CONSTRAINT "PK_ItensNivelEstoque" PRIMARY KEY ("Id", "IdUnidadeEstoque"),
    CONSTRAINT "FK_ItensNivelEstoque_ItensBase_Id" FOREIGN KEY ("Id") REFERENCES "ItensBase" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_ItensNivelEstoque_UnidadesEstoque_IdUnidadeEstoque" FOREIGN KEY ("IdUnidadeEstoque") REFERENCES "UnidadesEstoque" ("Id") ON DELETE RESTRICT
);

INSERT INTO "ef_temp_ItensNivelEstoque" ("Id", "IdUnidadeEstoque", "DataHoraAtualizacao", "DataHoraCriacao", "EditadorPor", "IsDeleted", "NivelMinimoEstoque")
SELECT "Id", "IdUnidadeEstoque", "DataHoraAtualizacao", "DataHoraCriacao", "EditadorPor", "IsDeleted", "NivelMinimoEstoque"
FROM "ItensNivelEstoque";

CREATE TABLE "ef_temp_ItensEstoque" (
    "Id" INTEGER NOT NULL,
    "IdUnidadeEstoque" INTEGER NOT NULL,
    "Lote" TEXT NOT NULL,
    "Codigo" TEXT NOT NULL,
    "DataEntrega" TEXT NOT NULL,
    "DataHoraAtualizacao" TEXT NOT NULL,
    "DataHoraCriacao" TEXT NOT NULL,
    "DataValidade" TEXT NULL,
    "EditadorPor" TEXT NOT NULL,
    "IsDeleted" INTEGER NOT NULL,
    "NFe" TEXT NULL,
    "Quantidade" INTEGER NOT NULL,
    "Versao" INTEGER NOT NULL,
    CONSTRAINT "PK_ItensEstoque" PRIMARY KEY ("Id", "IdUnidadeEstoque", "Lote"),
    CONSTRAINT "FK_ItensEstoque_ItensBase_Id" FOREIGN KEY ("Id") REFERENCES "ItensBase" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_ItensEstoque_UnidadesEstoque_IdUnidadeEstoque" FOREIGN KEY ("IdUnidadeEstoque") REFERENCES "UnidadesEstoque" ("Id") ON DELETE RESTRICT
);

INSERT INTO "ef_temp_ItensEstoque" ("Id", "IdUnidadeEstoque", "Lote", "Codigo", "DataEntrega", "DataHoraAtualizacao", "DataHoraCriacao", "DataValidade", "EditadorPor", "IsDeleted", "NFe", "Quantidade", "Versao")
SELECT "Id", "IdUnidadeEstoque", "Lote", "Codigo", "DataEntrega", "DataHoraAtualizacao", "DataHoraCriacao", "DataValidade", "EditadorPor", "IsDeleted", "NFe", "Quantidade", "Versao"
FROM "ItensEstoque";

COMMIT;

PRAGMA foreign_keys = 0;

BEGIN TRANSACTION;

DROP TABLE "ItensNivelEstoque";

ALTER TABLE "ef_temp_ItensNivelEstoque" RENAME TO "ItensNivelEstoque";

DROP TABLE "ItensEstoque";

ALTER TABLE "ef_temp_ItensEstoque" RENAME TO "ItensEstoque";

COMMIT;

PRAGMA foreign_keys = 1;

BEGIN TRANSACTION;

CREATE INDEX "IX_ItensNivelEstoque_IdUnidadeEstoque" ON "ItensNivelEstoque" ("IdUnidadeEstoque");

CREATE INDEX "IX_ItensEstoque_IdUnidadeEstoque" ON "ItensEstoque" ("IdUnidadeEstoque");

CREATE UNIQUE INDEX "IX_ItensEstoque_IdUnidadeEstoque_Lote" ON "ItensEstoque" ("IdUnidadeEstoque", "Lote");

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260624011017_EstoqueMultiUnidade', '8.0.11');

COMMIT;

BEGIN TRANSACTION;

DROP INDEX "IX_MovimentacoesEstoque_RetiradaId";

ALTER TABLE "Medicamentos" ADD "Unidade" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "UnidadesMedida" (
    "Id" INTEGER NOT NULL CONSTRAINT "PK_UnidadesMedida" PRIMARY KEY AUTOINCREMENT,
    "Nome" TEXT NOT NULL,
    "Sigla" TEXT NULL,
    "AplicavelProduto" INTEGER NOT NULL,
    "AplicavelMedicamento" INTEGER NOT NULL,
    "AplicavelInsumo" INTEGER NOT NULL,
    "Ativa" INTEGER NOT NULL,
    "DataHoraCriacao" TEXT NOT NULL,
    "DataHoraAtualizacao" TEXT NOT NULL,
    "EditadorPor" TEXT NOT NULL,
    "IsDeleted" INTEGER NOT NULL
);

INSERT INTO UnidadesMedida (Id, Nome, Sigla, AplicavelProduto, AplicavelMedicamento, AplicavelInsumo, Ativa, DataHoraCriacao, DataHoraAtualizacao, EditadorPor, IsDeleted) VALUES
(1, 'Unidade', 'UN', 1, 1, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Sistema', 0),
(2, 'Caixa', 'CX', 1, 1, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Sistema', 0),
(3, 'Quilo', 'KG', 1, 1, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Sistema', 0),
(4, 'Pacote', 'PCT', 1, 0, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Sistema', 0),
(5, 'Litro', 'L', 1, 1, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Sistema', 0),
(6, 'Ampola', NULL, 0, 1, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Sistema', 0),
(7, 'Comprimido', NULL, 0, 1, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Sistema', 0),
(8, 'Frasco', NULL, 0, 1, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Sistema', 0),
(9, 'Bandeja', NULL, 0, 0, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Sistema', 0),
(10, 'Barra', NULL, 0, 0, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Sistema', 0),
(11, 'Galão', NULL, 0, 0, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Sistema', 0),
(12, 'Kit', NULL, 0, 0, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Sistema', 0),
(13, 'Par', NULL, 0, 0, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Sistema', 0),
(14, 'Peça', NULL, 0, 0, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Sistema', 0),
(15, 'Rolo', NULL, 0, 0, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Sistema', 0),
(16, 'Tubo', NULL, 0, 0, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Sistema', 0),
(17, 'Vidro', NULL, 0, 0, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Sistema', 0),
(18, 'Grama', 'g', 0, 1, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Sistema', 0),
(19, 'Mililitro', 'ml', 0, 1, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Sistema', 0),
(20, 'Metro', 'm', 0, 0, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Sistema', 0),
(21, 'Centímetros', 'cm', 0, 0, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Sistema', 0);

UPDATE Insumos SET Unidade = CASE Unidade
    WHEN 1 THEN 6
    WHEN 2 THEN 9
    WHEN 3 THEN 10
    WHEN 4 THEN 2
    WHEN 5 THEN 7
    WHEN 6 THEN 8
    WHEN 7 THEN 11
    WHEN 8 THEN 12
    WHEN 9 THEN 13
    WHEN 10 THEN 4
    WHEN 11 THEN 14
    WHEN 12 THEN 15
    WHEN 13 THEN 16
    WHEN 14 THEN 1
    WHEN 15 THEN 17
    WHEN 16 THEN 3
    WHEN 17 THEN 5
    ELSE Unidade
END;

UPDATE Medicamentos SET Unidade = 7 WHERE Unidade = 0 OR Unidade IS NULL;

CREATE INDEX "IX_MovimentacoesEstoque_IdRetirada" ON "MovimentacoesEstoque" ("IdRetirada");

CREATE TABLE "ef_temp_MovimentacoesEstoque" (
    "Id" INTEGER NOT NULL CONSTRAINT "PK_MovimentacoesEstoque" PRIMARY KEY AUTOINCREMENT,
    "DataHoraMovimentacao" TEXT NOT NULL,
    "DoadorDocumento" TEXT NULL,
    "DoadorNome" TEXT NULL,
    "FornecedorDocumento" TEXT NULL,
    "FornecedorNome" TEXT NULL,
    "IdItem" INTEGER NOT NULL,
    "IdRetirada" INTEGER NULL,
    "IdTransferencia" INTEGER NULL,
    "IdUnidadeEstoque" INTEGER NOT NULL,
    "IdUsuario" INTEGER NOT NULL,
    "Lote" TEXT NOT NULL,
    "NFe" TEXT NULL,
    "Observacao" TEXT NULL,
    "OrigemMovimentacao" TEXT NULL,
    "Quantidade" INTEGER NOT NULL,
    "SaldoAposMovimentacao" INTEGER NOT NULL,
    "TipoMovimentacao" INTEGER NOT NULL,
    CONSTRAINT "FK_MovimentacoesEstoque_ItensBase_IdItem" FOREIGN KEY ("IdItem") REFERENCES "ItensBase" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_MovimentacoesEstoque_RetiradaEstoque_IdRetirada" FOREIGN KEY ("IdRetirada") REFERENCES "RetiradaEstoque" ("Id"),
    CONSTRAINT "FK_MovimentacoesEstoque_TransferenciasEstoque_IdTransferencia" FOREIGN KEY ("IdTransferencia") REFERENCES "TransferenciasEstoque" ("Id"),
    CONSTRAINT "FK_MovimentacoesEstoque_UnidadesEstoque_IdUnidadeEstoque" FOREIGN KEY ("IdUnidadeEstoque") REFERENCES "UnidadesEstoque" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_MovimentacoesEstoque_Usuarios_IdUsuario" FOREIGN KEY ("IdUsuario") REFERENCES "Usuarios" ("Id") ON DELETE CASCADE
);

INSERT INTO "ef_temp_MovimentacoesEstoque" ("Id", "DataHoraMovimentacao", "DoadorDocumento", "DoadorNome", "FornecedorDocumento", "FornecedorNome", "IdItem", "IdRetirada", "IdTransferencia", "IdUnidadeEstoque", "IdUsuario", "Lote", "NFe", "Observacao", "OrigemMovimentacao", "Quantidade", "SaldoAposMovimentacao", "TipoMovimentacao")
SELECT "Id", "DataHoraMovimentacao", "DoadorDocumento", "DoadorNome", "FornecedorDocumento", "FornecedorNome", "IdItem", "IdRetirada", "IdTransferencia", "IdUnidadeEstoque", "IdUsuario", "Lote", "NFe", "Observacao", "OrigemMovimentacao", "Quantidade", "SaldoAposMovimentacao", "TipoMovimentacao"
FROM "MovimentacoesEstoque";

COMMIT;

PRAGMA foreign_keys = 0;

BEGIN TRANSACTION;

DROP TABLE "MovimentacoesEstoque";

ALTER TABLE "ef_temp_MovimentacoesEstoque" RENAME TO "MovimentacoesEstoque";

COMMIT;

PRAGMA foreign_keys = 1;

BEGIN TRANSACTION;

CREATE INDEX "IX_MovimentacoesEstoque_IdItem_Lote" ON "MovimentacoesEstoque" ("IdItem", "Lote");

CREATE INDEX "IX_MovimentacoesEstoque_IdRetirada" ON "MovimentacoesEstoque" ("IdRetirada");

CREATE INDEX "IX_MovimentacoesEstoque_IdTransferencia" ON "MovimentacoesEstoque" ("IdTransferencia");

CREATE INDEX "IX_MovimentacoesEstoque_IdUnidadeEstoque_DataHoraMovimentacao" ON "MovimentacoesEstoque" ("IdUnidadeEstoque", "DataHoraMovimentacao");

CREATE INDEX "IX_MovimentacoesEstoque_IdUsuario" ON "MovimentacoesEstoque" ("IdUsuario");

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260704143922_UnidadesMedidaCatalogo', '8.0.11');

COMMIT;

BEGIN TRANSACTION;

ALTER TABLE "Usuarios" ADD "PodeGerenciarUnidadesMedida" INTEGER NOT NULL DEFAULT 0;

UPDATE Usuarios SET PodeGerenciarUnidadesMedida = 1 WHERE Permissao = 1;

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260704144948_UsuarioPodeGerenciarUnidadesMedida', '8.0.11');

COMMIT;

-- Corrige banco onde 20260705180720 foi registrada em __EFMigrationsHistory sem executar o Up().
-- SQLite 3.35+: IF NOT EXISTS evita erro se as colunas já existirem.
BEGIN TRANSACTION;

ALTER TABLE "TransferenciasEstoque" ADD COLUMN IF NOT EXISTS "ResponsavelEnvio" TEXT NOT NULL DEFAULT '';

ALTER TABLE "TransferenciasEstoque" ADD COLUMN IF NOT EXISTS "ResponsavelRecebimento" TEXT NULL;

COMMIT;
