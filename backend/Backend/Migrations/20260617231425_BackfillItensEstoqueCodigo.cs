using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class BackfillItensEstoqueCodigo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE ItensEstoque
                SET Codigo = (
                    SELECT Codigo FROM Produtos WHERE Produtos.Id = ItensEstoque.Id
                )
                WHERE (Codigo IS NULL OR Codigo = '')
                  AND EXISTS (SELECT 1 FROM Produtos WHERE Produtos.Id = ItensEstoque.Id);
                """);

            migrationBuilder.Sql("""
                UPDATE ItensEstoque
                SET Codigo = (
                    SELECT Codigo FROM Medicamentos WHERE Medicamentos.Id = ItensEstoque.Id
                )
                WHERE (Codigo IS NULL OR Codigo = '')
                  AND EXISTS (SELECT 1 FROM Medicamentos WHERE Medicamentos.Id = ItensEstoque.Id);
                """);

            migrationBuilder.Sql("""
                UPDATE ItensEstoque
                SET Codigo = (
                    SELECT Codigo FROM Insumos WHERE Insumos.Id = ItensEstoque.Id
                )
                WHERE (Codigo IS NULL OR Codigo = '')
                  AND EXISTS (SELECT 1 FROM Insumos WHERE Insumos.Id = ItensEstoque.Id);
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
