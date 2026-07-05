using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class CargosIntroducao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Idempotente para SQLite: permite retomar após falha parcial (tabela Cargos já criada, etc.).
            migrationBuilder.Sql("""
                CREATE TABLE IF NOT EXISTS "Cargos" (
                    "Id" INTEGER NOT NULL CONSTRAINT "PK_Cargos" PRIMARY KEY,
                    "Nome" TEXT NOT NULL,
                    "Descricao" TEXT NULL,
                    "EhAdministradorSistema" INTEGER NOT NULL,
                    "EhSistema" INTEGER NOT NULL,
                    "DataHoraCriacao" TEXT NOT NULL,
                    "DataHoraAtualizacao" TEXT NOT NULL,
                    "EditadorPor" TEXT NOT NULL,
                    "IsDeleted" INTEGER NOT NULL
                );
                """);

            migrationBuilder.Sql("""
                INSERT OR IGNORE INTO "Cargos" (
                    "Id", "Nome", "Descricao", "EhAdministradorSistema", "EhSistema",
                    "DataHoraCriacao", "DataHoraAtualizacao", "EditadorPor", "IsDeleted")
                VALUES
                    (1, 'Administrador', 'Acesso total ao sistema.', 1, 1,
                     '2026-01-01T00:00:00.0000000Z', '2026-01-01T00:00:00.0000000Z', 'Sistema', 0),
                    (2, 'Grupo Padrão', 'Grupo padrão para novos usuários; permissões de estoque por unidade.', 0, 1,
                     '2026-01-01T00:00:00.0000000Z', '2026-01-01T00:00:00.0000000Z', 'Sistema', 0);
                UPDATE "Cargos"
                SET "Nome" = 'Grupo Padrão',
                    "Descricao" = 'Grupo padrão para novos usuários; permissões de estoque por unidade.'
                WHERE "Id" = 2 AND "Nome" = 'Leitura';
                """);

            migrationBuilder.Sql("""
                DROP TABLE IF EXISTS "ef_temp_Usuarios";
                """);

            migrationBuilder.RenameColumn(
                name: "Permissao",
                table: "Usuarios",
                newName: "IdCargo");

            migrationBuilder.Sql("""
                UPDATE "Usuarios"
                SET "IdCargo" = 2
                WHERE "IdCargo" IS NULL OR "IdCargo" NOT IN (1, 2);
                """);

            migrationBuilder.Sql("""
                CREATE TABLE IF NOT EXISTS "CargosPermissoes" (
                    "Id" INTEGER NOT NULL CONSTRAINT "PK_CargosPermissoes" PRIMARY KEY AUTOINCREMENT,
                    "IdCargo" INTEGER NOT NULL,
                    "IdPermissao" INTEGER NOT NULL,
                    "IdUnidadeEstoque" INTEGER NULL,
                    CONSTRAINT "FK_CargosPermissoes_Cargos_IdCargo" FOREIGN KEY ("IdCargo") REFERENCES "Cargos" ("Id") ON DELETE CASCADE,
                    CONSTRAINT "FK_CargosPermissoes_Permissoes_IdPermissao" FOREIGN KEY ("IdPermissao") REFERENCES "Permissoes" ("Id") ON DELETE CASCADE,
                    CONSTRAINT "FK_CargosPermissoes_UnidadesEstoque_IdUnidadeEstoque" FOREIGN KEY ("IdUnidadeEstoque") REFERENCES "UnidadesEstoque" ("Id") ON DELETE CASCADE
                );
                """);

            migrationBuilder.Sql("""
                CREATE INDEX IF NOT EXISTS "IX_Usuarios_IdCargo" ON "Usuarios" ("IdCargo");
                CREATE UNIQUE INDEX IF NOT EXISTS "IX_Cargos_Nome" ON "Cargos" ("Nome");
                CREATE UNIQUE INDEX IF NOT EXISTS "IX_CargosPermissoes_IdCargo_IdPermissao_IdUnidadeEstoque"
                    ON "CargosPermissoes" ("IdCargo", "IdPermissao", "IdUnidadeEstoque");
                CREATE INDEX IF NOT EXISTS "IX_CargosPermissoes_IdPermissao" ON "CargosPermissoes" ("IdPermissao");
                CREATE INDEX IF NOT EXISTS "IX_CargosPermissoes_IdUnidadeEstoque" ON "CargosPermissoes" ("IdUnidadeEstoque");
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Usuarios_Cargos_IdCargo",
                table: "Usuarios");

            migrationBuilder.DropTable(
                name: "CargosPermissoes");

            migrationBuilder.DropTable(
                name: "Cargos");

            migrationBuilder.DropIndex(
                name: "IX_Usuarios_IdCargo",
                table: "Usuarios");

            migrationBuilder.RenameColumn(
                name: "IdCargo",
                table: "Usuarios",
                newName: "Permissao");
        }
    }
}
