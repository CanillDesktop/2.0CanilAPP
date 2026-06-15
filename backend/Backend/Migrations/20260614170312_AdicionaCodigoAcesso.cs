using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AdicionaCodigoAcesso : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CodigoAcesso",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false),
                    Codigo = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                    DataHoraAtualizacao = table.Column<DateTime>(type: "TEXT", nullable: false),
                    EditadoPor = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CodigoAcesso", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "CodigoAcesso",
                columns: new[] { "Id", "Codigo", "DataHoraAtualizacao", "EditadoPor" },
                values: new object[] { 1, "canil@acesso", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Sistema" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CodigoAcesso");
        }
    }
}
