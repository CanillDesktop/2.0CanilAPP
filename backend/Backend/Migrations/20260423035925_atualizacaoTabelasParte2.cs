using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class atualizacaoTabelasParte2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "DataHoraCriacao",
                table: "RetiradaEstoque",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2026, 4, 23, 3, 59, 25, 53, DateTimeKind.Utc).AddTicks(3913),
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldDefaultValue: new DateTime(2026, 4, 23, 3, 57, 17, 986, DateTimeKind.Utc).AddTicks(5328));

            migrationBuilder.AlterColumn<DateTime>(
                name: "DataHoraAtualizacao",
                table: "RetiradaEstoque",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2026, 4, 23, 3, 59, 25, 53, DateTimeKind.Utc).AddTicks(4206),
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldDefaultValue: new DateTime(2026, 4, 23, 3, 57, 17, 986, DateTimeKind.Utc).AddTicks(5586));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "DataHoraCriacao",
                table: "RetiradaEstoque",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2026, 4, 23, 3, 57, 17, 986, DateTimeKind.Utc).AddTicks(5328),
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldDefaultValue: new DateTime(2026, 4, 23, 3, 59, 25, 53, DateTimeKind.Utc).AddTicks(3913));

            migrationBuilder.AlterColumn<DateTime>(
                name: "DataHoraAtualizacao",
                table: "RetiradaEstoque",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2026, 4, 23, 3, 57, 17, 986, DateTimeKind.Utc).AddTicks(5586),
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldDefaultValue: new DateTime(2026, 4, 23, 3, 59, 25, 53, DateTimeKind.Utc).AddTicks(4206));
        }
    }
}
