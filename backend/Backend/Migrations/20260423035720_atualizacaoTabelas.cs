using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class atualizacaoTabelas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DataAtualizacao",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "RefreshToken",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "DataAtualizacao",
                table: "RetiradaEstoque");

            migrationBuilder.DropColumn(
                name: "DataHoraInsercaoRegistro",
                table: "RetiradaEstoque");

            migrationBuilder.DropColumn(
                name: "DataAtualizacao",
                table: "Produtos");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Produtos");

            migrationBuilder.DropColumn(
                name: "DataAtualizacao",
                table: "Medicamentos");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Medicamentos");

            migrationBuilder.DropColumn(
                name: "DataAtualizacao",
                table: "Insumos");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Insumos");

            migrationBuilder.RenameColumn(
                name: "DataHoraExpiracaoRefreshToken",
                table: "Usuarios",
                newName: "DataHoraAtualizacao");

            migrationBuilder.RenameColumn(
                name: "DataHoraInsercaoRegistro",
                table: "ItensNivelEstoque",
                newName: "DataHoraCriacao");

            migrationBuilder.RenameColumn(
                name: "DataHoraInsercaoRegistro",
                table: "ItensEstoque",
                newName: "DataHoraCriacao");

            migrationBuilder.RenameColumn(
                name: "DataHoraInsercaoRegistro",
                table: "ItensBase",
                newName: "DataHoraCriacao");

            migrationBuilder.AlterColumn<string>(
                name: "PrimeiroNome",
                table: "Usuarios",
                type: "TEXT",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Permissao",
                table: "Usuarios",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "HashSenha",
                table: "Usuarios",
                type: "TEXT",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Usuarios",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DataHoraAtualizacao",
                table: "RetiradaEstoque",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2026, 4, 23, 3, 57, 17, 986, DateTimeKind.Utc).AddTicks(5586));

            migrationBuilder.AddColumn<DateTime>(
                name: "DataHoraCriacao",
                table: "RetiradaEstoque",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2026, 4, 23, 3, 57, 17, 986, DateTimeKind.Utc).AddTicks(5328));

            migrationBuilder.AddColumn<DateTime>(
                name: "DataHoraAtualizacao",
                table: "ItensNivelEstoque",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "ItensNivelEstoque",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DataHoraAtualizacao",
                table: "ItensEstoque",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "ItensEstoque",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DataHoraAtualizacao",
                table: "ItensBase",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "ItensBase",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "RefreshTokens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    TokenHash = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    RevokedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    ReplacedByTokenHash = table.Column<string>(type: "TEXT", nullable: true),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefreshTokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RefreshTokens_Usuarios_UserId",
                        column: x => x.UserId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_UserId",
                table: "RefreshTokens",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RefreshTokens");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "DataHoraAtualizacao",
                table: "RetiradaEstoque");

            migrationBuilder.DropColumn(
                name: "DataHoraCriacao",
                table: "RetiradaEstoque");

            migrationBuilder.DropColumn(
                name: "DataHoraAtualizacao",
                table: "ItensNivelEstoque");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "ItensNivelEstoque");

            migrationBuilder.DropColumn(
                name: "DataHoraAtualizacao",
                table: "ItensEstoque");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "ItensEstoque");

            migrationBuilder.DropColumn(
                name: "DataHoraAtualizacao",
                table: "ItensBase");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "ItensBase");

            migrationBuilder.RenameColumn(
                name: "DataHoraAtualizacao",
                table: "Usuarios",
                newName: "DataHoraExpiracaoRefreshToken");

            migrationBuilder.RenameColumn(
                name: "DataHoraCriacao",
                table: "ItensNivelEstoque",
                newName: "DataHoraInsercaoRegistro");

            migrationBuilder.RenameColumn(
                name: "DataHoraCriacao",
                table: "ItensEstoque",
                newName: "DataHoraInsercaoRegistro");

            migrationBuilder.RenameColumn(
                name: "DataHoraCriacao",
                table: "ItensBase",
                newName: "DataHoraInsercaoRegistro");

            migrationBuilder.AlterColumn<string>(
                name: "PrimeiroNome",
                table: "Usuarios",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<int>(
                name: "Permissao",
                table: "Usuarios",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AlterColumn<string>(
                name: "HashSenha",
                table: "Usuarios",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AddColumn<DateTime>(
                name: "DataAtualizacao",
                table: "Usuarios",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "RefreshToken",
                table: "Usuarios",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DataAtualizacao",
                table: "RetiradaEstoque",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2026, 4, 8, 23, 19, 2, 729, DateTimeKind.Utc).AddTicks(888));

            migrationBuilder.AddColumn<DateTime>(
                name: "DataHoraInsercaoRegistro",
                table: "RetiradaEstoque",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "DataAtualizacao",
                table: "Produtos",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Produtos",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DataAtualizacao",
                table: "Medicamentos",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Medicamentos",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DataAtualizacao",
                table: "Insumos",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Insumos",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }
    }
}
