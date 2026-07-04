using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class UnidadesMedidaCatalogo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MovimentacoesEstoque_RetiradaEstoque_RetiradaId",
                table: "MovimentacoesEstoque");

            migrationBuilder.DropIndex(
                name: "IX_MovimentacoesEstoque_RetiradaId",
                table: "MovimentacoesEstoque");

            migrationBuilder.DropColumn(
                name: "RetiradaId",
                table: "MovimentacoesEstoque");

            migrationBuilder.AddColumn<int>(
                name: "Unidade",
                table: "Medicamentos",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "UnidadesMedida",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Nome = table.Column<string>(type: "TEXT", nullable: false),
                    Sigla = table.Column<string>(type: "TEXT", nullable: true),
                    AplicavelProduto = table.Column<bool>(type: "INTEGER", nullable: false),
                    AplicavelMedicamento = table.Column<bool>(type: "INTEGER", nullable: false),
                    AplicavelInsumo = table.Column<bool>(type: "INTEGER", nullable: false),
                    Ativa = table.Column<bool>(type: "INTEGER", nullable: false),
                    DataHoraCriacao = table.Column<DateTime>(type: "TEXT", nullable: false),
                    DataHoraAtualizacao = table.Column<DateTime>(type: "TEXT", nullable: false),
                    EditadorPor = table.Column<string>(type: "TEXT", nullable: false),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UnidadesMedida", x => x.Id);
                });

            // Catálogo inicial unificado (ids estáveis para remapear enums antigos).
            // Produto antigo: 1=UN,2=CX,3=KG,4=PCT (permanece 1..4).
            // Insumo antigo: 1..21 é remapeado abaixo.
            migrationBuilder.Sql("""
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
                """);

            migrationBuilder.CreateIndex(
                name: "IX_MovimentacoesEstoque_IdRetirada",
                table: "MovimentacoesEstoque",
                column: "IdRetirada");

            migrationBuilder.AddForeignKey(
                name: "FK_MovimentacoesEstoque_RetiradaEstoque_IdRetirada",
                table: "MovimentacoesEstoque",
                column: "IdRetirada",
                principalTable: "RetiradaEstoque",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MovimentacoesEstoque_RetiradaEstoque_IdRetirada",
                table: "MovimentacoesEstoque");

            migrationBuilder.DropTable(
                name: "UnidadesMedida");

            migrationBuilder.DropIndex(
                name: "IX_MovimentacoesEstoque_IdRetirada",
                table: "MovimentacoesEstoque");

            migrationBuilder.DropColumn(
                name: "Unidade",
                table: "Medicamentos");

            migrationBuilder.AddColumn<int>(
                name: "RetiradaId",
                table: "MovimentacoesEstoque",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_MovimentacoesEstoque_RetiradaId",
                table: "MovimentacoesEstoque",
                column: "RetiradaId");

            migrationBuilder.AddForeignKey(
                name: "FK_MovimentacoesEstoque_RetiradaEstoque_RetiradaId",
                table: "MovimentacoesEstoque",
                column: "RetiradaId",
                principalTable: "RetiradaEstoque",
                principalColumn: "Id");
        }
    }
}
