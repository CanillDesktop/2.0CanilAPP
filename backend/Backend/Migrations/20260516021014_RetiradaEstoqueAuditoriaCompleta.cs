using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class RetiradaEstoqueAuditoriaCompleta : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DataHoraRetirada",
                table: "RetiradaEstoque",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2026, 5, 15, 0, 0, 0, DateTimeKind.Utc));

            migrationBuilder.AddColumn<int>(
                name: "IdUsuarioRecebedor",
                table: "RetiradaEstoque",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "IdUsuarioRetirante",
                table: "RetiradaEstoque",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Observacao",
                table: "RetiradaEstoque",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "RetiradaEstoque",
                type: "TEXT",
                maxLength: 48,
                nullable: false,
                defaultValue: "CONFIRMADA");

            migrationBuilder.Sql("UPDATE RetiradaEstoque SET DataHoraRetirada = datetime('now');");

            migrationBuilder.CreateIndex(
                name: "IX_RetiradaEstoque_DataHoraRetirada",
                table: "RetiradaEstoque",
                column: "DataHoraRetirada");

            migrationBuilder.CreateIndex(
                name: "IX_RetiradaEstoque_IdUsuarioRecebedor",
                table: "RetiradaEstoque",
                column: "IdUsuarioRecebedor");

            migrationBuilder.CreateIndex(
                name: "IX_RetiradaEstoque_IdUsuarioRetirante",
                table: "RetiradaEstoque",
                column: "IdUsuarioRetirante");

            migrationBuilder.AddForeignKey(
                name: "FK_RetiradaEstoque_Usuarios_IdUsuarioRecebedor",
                table: "RetiradaEstoque",
                column: "IdUsuarioRecebedor",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_RetiradaEstoque_Usuarios_IdUsuarioRetirante",
                table: "RetiradaEstoque",
                column: "IdUsuarioRetirante",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RetiradaEstoque_Usuarios_IdUsuarioRecebedor",
                table: "RetiradaEstoque");

            migrationBuilder.DropForeignKey(
                name: "FK_RetiradaEstoque_Usuarios_IdUsuarioRetirante",
                table: "RetiradaEstoque");

            migrationBuilder.DropIndex(
                name: "IX_RetiradaEstoque_DataHoraRetirada",
                table: "RetiradaEstoque");

            migrationBuilder.DropIndex(
                name: "IX_RetiradaEstoque_IdUsuarioRecebedor",
                table: "RetiradaEstoque");

            migrationBuilder.DropIndex(
                name: "IX_RetiradaEstoque_IdUsuarioRetirante",
                table: "RetiradaEstoque");

            migrationBuilder.DropColumn(
                name: "DataHoraRetirada",
                table: "RetiradaEstoque");

            migrationBuilder.DropColumn(
                name: "IdUsuarioRecebedor",
                table: "RetiradaEstoque");

            migrationBuilder.DropColumn(
                name: "IdUsuarioRetirante",
                table: "RetiradaEstoque");

            migrationBuilder.DropColumn(
                name: "Observacao",
                table: "RetiradaEstoque");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "RetiradaEstoque");
        }
    }
}
