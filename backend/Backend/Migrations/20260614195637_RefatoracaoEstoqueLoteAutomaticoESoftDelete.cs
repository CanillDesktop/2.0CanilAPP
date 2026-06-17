using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class RefatoracaoEstoqueLoteAutomaticoESoftDelete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DataValidadeLote",
                table: "RetiradaEstoque",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "EstavaVencido",
                table: "RetiradaEstoque",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AlterColumn<string>(
                name: "DescricaoDetalhada",
                table: "Produtos",
                type: "TEXT",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Descricao",
                table: "Medicamentos",
                type: "TEXT",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "DescricaoDetalhada",
                table: "Insumos",
                type: "TEXT",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "ContadoresLote",
                columns: table => new
                {
                    Tipo = table.Column<string>(type: "TEXT", maxLength: 8, nullable: false),
                    UltimoNumero = table.Column<long>(type: "INTEGER", nullable: false),
                    Versao = table.Column<long>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContadoresLote", x => x.Tipo);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ItensEstoque_Lote",
                table: "ItensEstoque",
                column: "Lote",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ContadoresLote");

            migrationBuilder.DropIndex(
                name: "IX_ItensEstoque_Lote",
                table: "ItensEstoque");

            migrationBuilder.DropColumn(
                name: "DataValidadeLote",
                table: "RetiradaEstoque");

            migrationBuilder.DropColumn(
                name: "EstavaVencido",
                table: "RetiradaEstoque");

            migrationBuilder.AlterColumn<string>(
                name: "DescricaoDetalhada",
                table: "Produtos",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<string>(
                name: "Descricao",
                table: "Medicamentos",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<string>(
                name: "DescricaoDetalhada",
                table: "Insumos",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT");
        }
    }
}
