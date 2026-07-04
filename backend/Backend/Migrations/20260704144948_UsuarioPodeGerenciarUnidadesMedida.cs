using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class UsuarioPodeGerenciarUnidadesMedida : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "PodeGerenciarUnidadesMedida",
                table: "Usuarios",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            // Administradores passam a ter a permissão por padrão.
            migrationBuilder.Sql("UPDATE Usuarios SET PodeGerenciarUnidadesMedida = 1 WHERE Permissao = 1;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PodeGerenciarUnidadesMedida",
                table: "Usuarios");
        }
    }
}
