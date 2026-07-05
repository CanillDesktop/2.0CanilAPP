using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class TransferenciaResponsaveisDestinoOpcional : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ResponsavelEnvio",
                table: "TransferenciasEstoque",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ResponsavelRecebimento",
                table: "TransferenciasEstoque",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "IdUnidadeDestino",
                table: "TransferenciasEstoque",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ResponsavelEnvio",
                table: "TransferenciasEstoque");

            migrationBuilder.DropColumn(
                name: "ResponsavelRecebimento",
                table: "TransferenciasEstoque");

            migrationBuilder.AlterColumn<int>(
                name: "IdUnidadeDestino",
                table: "TransferenciasEstoque",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true);
        }
    }
}
