using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class EstoqueMultiUnidade : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Usuarios_Status",
                table: "Usuarios");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ItensNivelEstoque",
                table: "ItensNivelEstoque");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ItensEstoque",
                table: "ItensEstoque");

            migrationBuilder.DropIndex(
                name: "IX_ItensEstoque_Lote",
                table: "ItensEstoque");

            migrationBuilder.AddColumn<int>(
                name: "IdMovimentacao",
                table: "RetiradaEstoque",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "IdUnidadeEstoque",
                table: "RetiradaEstoque",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "ItensNivelEstoque",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .OldAnnotation("Sqlite:Autoincrement", true);

            migrationBuilder.AddColumn<int>(
                name: "IdUnidadeEstoque",
                table: "ItensNivelEstoque",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "IdUnidadeEstoque",
                table: "ItensEstoque",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddPrimaryKey(
                name: "PK_ItensNivelEstoque",
                table: "ItensNivelEstoque",
                columns: new[] { "Id", "IdUnidadeEstoque" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_ItensEstoque",
                table: "ItensEstoque",
                columns: new[] { "Id", "IdUnidadeEstoque", "Lote" });

            migrationBuilder.CreateTable(
                name: "UnidadesEstoque",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Nome = table.Column<string>(type: "TEXT", nullable: false),
                    Sigla = table.Column<string>(type: "TEXT", nullable: false),
                    Tipo = table.Column<string>(type: "TEXT", nullable: false),
                    Ativa = table.Column<bool>(type: "INTEGER", nullable: false),
                    DataCadastro = table.Column<DateTime>(type: "TEXT", nullable: false),
                    DataHoraCriacao = table.Column<DateTime>(type: "TEXT", nullable: false),
                    DataHoraAtualizacao = table.Column<DateTime>(type: "TEXT", nullable: false),
                    EditadorPor = table.Column<string>(type: "TEXT", nullable: false),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UnidadesEstoque", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TransferenciasEstoque",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    IdUnidadeOrigem = table.Column<int>(type: "INTEGER", nullable: false),
                    IdUnidadeDestino = table.Column<int>(type: "INTEGER", nullable: false),
                    DataTransferencia = table.Column<DateTime>(type: "TEXT", nullable: false),
                    IdUsuarioEnvio = table.Column<int>(type: "INTEGER", nullable: false),
                    IdUsuarioRecebimento = table.Column<int>(type: "INTEGER", nullable: true),
                    IdUsuarioAprovacao = table.Column<int>(type: "INTEGER", nullable: true),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    Observacao = table.Column<string>(type: "TEXT", nullable: true),
                    DataHoraCriacao = table.Column<DateTime>(type: "TEXT", nullable: false),
                    DataHoraAtualizacao = table.Column<DateTime>(type: "TEXT", nullable: false),
                    EditadorPor = table.Column<string>(type: "TEXT", nullable: false),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TransferenciasEstoque", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TransferenciasEstoque_UnidadesEstoque_IdUnidadeDestino",
                        column: x => x.IdUnidadeDestino,
                        principalTable: "UnidadesEstoque",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TransferenciasEstoque_UnidadesEstoque_IdUnidadeOrigem",
                        column: x => x.IdUnidadeOrigem,
                        principalTable: "UnidadesEstoque",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TransferenciasEstoque_Usuarios_IdUsuarioEnvio",
                        column: x => x.IdUsuarioEnvio,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TransferenciasEstoque_Usuarios_IdUsuarioRecebimento",
                        column: x => x.IdUsuarioRecebimento,
                        principalTable: "Usuarios",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "UsuariosUnidadesEstoque",
                columns: table => new
                {
                    IdUsuario = table.Column<int>(type: "INTEGER", nullable: false),
                    IdUnidadeEstoque = table.Column<int>(type: "INTEGER", nullable: false),
                    PodeConsultar = table.Column<bool>(type: "INTEGER", nullable: false),
                    PodeEntrada = table.Column<bool>(type: "INTEGER", nullable: false),
                    PodeSaida = table.Column<bool>(type: "INTEGER", nullable: false),
                    PodeTransferirEnviar = table.Column<bool>(type: "INTEGER", nullable: false),
                    PodeTransferirReceber = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UsuariosUnidadesEstoque", x => new { x.IdUsuario, x.IdUnidadeEstoque });
                    table.ForeignKey(
                        name: "FK_UsuariosUnidadesEstoque_UnidadesEstoque_IdUnidadeEstoque",
                        column: x => x.IdUnidadeEstoque,
                        principalTable: "UnidadesEstoque",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UsuariosUnidadesEstoque_Usuarios_IdUsuario",
                        column: x => x.IdUsuario,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MovimentacoesEstoque",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    IdUnidadeEstoque = table.Column<int>(type: "INTEGER", nullable: false),
                    IdItem = table.Column<int>(type: "INTEGER", nullable: false),
                    Lote = table.Column<string>(type: "TEXT", nullable: false),
                    Quantidade = table.Column<int>(type: "INTEGER", nullable: false),
                    SaldoAposMovimentacao = table.Column<int>(type: "INTEGER", nullable: false),
                    TipoMovimentacao = table.Column<int>(type: "INTEGER", nullable: false),
                    OrigemMovimentacao = table.Column<string>(type: "TEXT", nullable: true),
                    IdTransferencia = table.Column<int>(type: "INTEGER", nullable: true),
                    IdRetirada = table.Column<int>(type: "INTEGER", nullable: true),
                    IdUsuario = table.Column<int>(type: "INTEGER", nullable: false),
                    DataHoraMovimentacao = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Observacao = table.Column<string>(type: "TEXT", nullable: true),
                    NFe = table.Column<string>(type: "TEXT", nullable: true),
                    FornecedorNome = table.Column<string>(type: "TEXT", nullable: true),
                    FornecedorDocumento = table.Column<string>(type: "TEXT", nullable: true),
                    DoadorNome = table.Column<string>(type: "TEXT", nullable: true),
                    DoadorDocumento = table.Column<string>(type: "TEXT", nullable: true),
                    RetiradaId = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MovimentacoesEstoque", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MovimentacoesEstoque_ItensBase_IdItem",
                        column: x => x.IdItem,
                        principalTable: "ItensBase",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MovimentacoesEstoque_RetiradaEstoque_RetiradaId",
                        column: x => x.RetiradaId,
                        principalTable: "RetiradaEstoque",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_MovimentacoesEstoque_TransferenciasEstoque_IdTransferencia",
                        column: x => x.IdTransferencia,
                        principalTable: "TransferenciasEstoque",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_MovimentacoesEstoque_UnidadesEstoque_IdUnidadeEstoque",
                        column: x => x.IdUnidadeEstoque,
                        principalTable: "UnidadesEstoque",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MovimentacoesEstoque_Usuarios_IdUsuario",
                        column: x => x.IdUsuario,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TransferenciasEstoqueItens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    IdTransferencia = table.Column<int>(type: "INTEGER", nullable: false),
                    IdItem = table.Column<int>(type: "INTEGER", nullable: false),
                    Lote = table.Column<string>(type: "TEXT", nullable: false),
                    Quantidade = table.Column<int>(type: "INTEGER", nullable: false),
                    ValorUnitario = table.Column<decimal>(type: "TEXT", nullable: true),
                    IdMovimentacaoSaida = table.Column<int>(type: "INTEGER", nullable: true),
                    IdMovimentacaoEntrada = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TransferenciasEstoqueItens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TransferenciasEstoqueItens_ItensBase_IdItem",
                        column: x => x.IdItem,
                        principalTable: "ItensBase",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TransferenciasEstoqueItens_TransferenciasEstoque_IdTransferencia",
                        column: x => x.IdTransferencia,
                        principalTable: "TransferenciasEstoque",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "UnidadesEstoque",
                columns: new[] { "Id", "Ativa", "DataCadastro", "DataHoraAtualizacao", "DataHoraCriacao", "EditadorPor", "IsDeleted", "Nome", "Sigla", "Tipo" },
                values: new object[,]
                {
                    { 1, true, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Sistema", false, "Secretaria", "SEC", "ADMINISTRATIVO" },
                    { 2, true, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Sistema", false, "Canil", "CAN", "OPERACIONAL" }
                });

            migrationBuilder.Sql("UPDATE ItensEstoque SET IdUnidadeEstoque = 1 WHERE IdUnidadeEstoque = 0;");
            migrationBuilder.Sql("UPDATE ItensNivelEstoque SET IdUnidadeEstoque = 1 WHERE IdUnidadeEstoque = 0;");
            migrationBuilder.Sql("UPDATE RetiradaEstoque SET IdUnidadeEstoque = 1 WHERE IdUnidadeEstoque = 0;");

            migrationBuilder.CreateIndex(
                name: "IX_RetiradaEstoque_IdUnidadeEstoque_DataHoraRetirada",
                table: "RetiradaEstoque",
                columns: new[] { "IdUnidadeEstoque", "DataHoraRetirada" });

            migrationBuilder.CreateIndex(
                name: "IX_ItensNivelEstoque_IdUnidadeEstoque",
                table: "ItensNivelEstoque",
                column: "IdUnidadeEstoque");

            migrationBuilder.CreateIndex(
                name: "IX_ItensEstoque_IdUnidadeEstoque",
                table: "ItensEstoque",
                column: "IdUnidadeEstoque");

            migrationBuilder.CreateIndex(
                name: "IX_ItensEstoque_IdUnidadeEstoque_Lote",
                table: "ItensEstoque",
                columns: new[] { "IdUnidadeEstoque", "Lote" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MovimentacoesEstoque_IdItem_Lote",
                table: "MovimentacoesEstoque",
                columns: new[] { "IdItem", "Lote" });

            migrationBuilder.CreateIndex(
                name: "IX_MovimentacoesEstoque_IdTransferencia",
                table: "MovimentacoesEstoque",
                column: "IdTransferencia");

            migrationBuilder.CreateIndex(
                name: "IX_MovimentacoesEstoque_IdUnidadeEstoque_DataHoraMovimentacao",
                table: "MovimentacoesEstoque",
                columns: new[] { "IdUnidadeEstoque", "DataHoraMovimentacao" });

            migrationBuilder.CreateIndex(
                name: "IX_MovimentacoesEstoque_IdUsuario",
                table: "MovimentacoesEstoque",
                column: "IdUsuario");

            migrationBuilder.CreateIndex(
                name: "IX_MovimentacoesEstoque_RetiradaId",
                table: "MovimentacoesEstoque",
                column: "RetiradaId");

            migrationBuilder.CreateIndex(
                name: "IX_TransferenciasEstoque_IdUnidadeDestino",
                table: "TransferenciasEstoque",
                column: "IdUnidadeDestino");

            migrationBuilder.CreateIndex(
                name: "IX_TransferenciasEstoque_IdUnidadeOrigem_IdUnidadeDestino_DataTransferencia",
                table: "TransferenciasEstoque",
                columns: new[] { "IdUnidadeOrigem", "IdUnidadeDestino", "DataTransferencia" });

            migrationBuilder.CreateIndex(
                name: "IX_TransferenciasEstoque_IdUsuarioEnvio",
                table: "TransferenciasEstoque",
                column: "IdUsuarioEnvio");

            migrationBuilder.CreateIndex(
                name: "IX_TransferenciasEstoque_IdUsuarioRecebimento",
                table: "TransferenciasEstoque",
                column: "IdUsuarioRecebimento");

            migrationBuilder.CreateIndex(
                name: "IX_TransferenciasEstoque_Status",
                table: "TransferenciasEstoque",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_TransferenciasEstoqueItens_IdItem",
                table: "TransferenciasEstoqueItens",
                column: "IdItem");

            migrationBuilder.CreateIndex(
                name: "IX_TransferenciasEstoqueItens_IdTransferencia",
                table: "TransferenciasEstoqueItens",
                column: "IdTransferencia");

            migrationBuilder.CreateIndex(
                name: "IX_UnidadesEstoque_Sigla",
                table: "UnidadesEstoque",
                column: "Sigla",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UsuariosUnidadesEstoque_IdUnidadeEstoque",
                table: "UsuariosUnidadesEstoque",
                column: "IdUnidadeEstoque");

            migrationBuilder.AddForeignKey(
                name: "FK_ItensEstoque_UnidadesEstoque_IdUnidadeEstoque",
                table: "ItensEstoque",
                column: "IdUnidadeEstoque",
                principalTable: "UnidadesEstoque",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ItensNivelEstoque_UnidadesEstoque_IdUnidadeEstoque",
                table: "ItensNivelEstoque",
                column: "IdUnidadeEstoque",
                principalTable: "UnidadesEstoque",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ItensEstoque_UnidadesEstoque_IdUnidadeEstoque",
                table: "ItensEstoque");

            migrationBuilder.DropForeignKey(
                name: "FK_ItensNivelEstoque_UnidadesEstoque_IdUnidadeEstoque",
                table: "ItensNivelEstoque");

            migrationBuilder.DropTable(
                name: "MovimentacoesEstoque");

            migrationBuilder.DropTable(
                name: "TransferenciasEstoqueItens");

            migrationBuilder.DropTable(
                name: "UsuariosUnidadesEstoque");

            migrationBuilder.DropTable(
                name: "TransferenciasEstoque");

            migrationBuilder.DropTable(
                name: "UnidadesEstoque");

            migrationBuilder.DropIndex(
                name: "IX_RetiradaEstoque_IdUnidadeEstoque_DataHoraRetirada",
                table: "RetiradaEstoque");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ItensNivelEstoque",
                table: "ItensNivelEstoque");

            migrationBuilder.DropIndex(
                name: "IX_ItensNivelEstoque_IdUnidadeEstoque",
                table: "ItensNivelEstoque");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ItensEstoque",
                table: "ItensEstoque");

            migrationBuilder.DropIndex(
                name: "IX_ItensEstoque_IdUnidadeEstoque",
                table: "ItensEstoque");

            migrationBuilder.DropIndex(
                name: "IX_ItensEstoque_IdUnidadeEstoque_Lote",
                table: "ItensEstoque");

            migrationBuilder.DropColumn(
                name: "IdMovimentacao",
                table: "RetiradaEstoque");

            migrationBuilder.DropColumn(
                name: "IdUnidadeEstoque",
                table: "RetiradaEstoque");

            migrationBuilder.DropColumn(
                name: "IdUnidadeEstoque",
                table: "ItensNivelEstoque");

            migrationBuilder.DropColumn(
                name: "IdUnidadeEstoque",
                table: "ItensEstoque");

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "ItensNivelEstoque",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .Annotation("Sqlite:Autoincrement", true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_ItensNivelEstoque",
                table: "ItensNivelEstoque",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ItensEstoque",
                table: "ItensEstoque",
                columns: new[] { "Id", "Lote" });

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_Status",
                table: "Usuarios",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_ItensEstoque_Lote",
                table: "ItensEstoque",
                column: "Lote",
                unique: true);
        }
    }
}
