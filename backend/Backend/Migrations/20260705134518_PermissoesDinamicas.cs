using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class PermissoesDinamicas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Permissoes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Codigo = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    Nome = table.Column<string>(type: "TEXT", maxLength: 160, nullable: false),
                    Descricao = table.Column<string>(type: "TEXT", nullable: true),
                    Categoria = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    EscopoUnidadeEstoque = table.Column<bool>(type: "INTEGER", nullable: false),
                    EhSistema = table.Column<bool>(type: "INTEGER", nullable: false),
                    DataHoraCriacao = table.Column<DateTime>(type: "TEXT", nullable: false),
                    DataHoraAtualizacao = table.Column<DateTime>(type: "TEXT", nullable: false),
                    EditadorPor = table.Column<string>(type: "TEXT", nullable: false),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Permissoes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UsuariosPermissoes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    IdUsuario = table.Column<int>(type: "INTEGER", nullable: false),
                    IdPermissao = table.Column<int>(type: "INTEGER", nullable: false),
                    IdUnidadeEstoque = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UsuariosPermissoes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UsuariosPermissoes_Permissoes_IdPermissao",
                        column: x => x.IdPermissao,
                        principalTable: "Permissoes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UsuariosPermissoes_UnidadesEstoque_IdUnidadeEstoque",
                        column: x => x.IdUnidadeEstoque,
                        principalTable: "UnidadesEstoque",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UsuariosPermissoes_Usuarios_IdUsuario",
                        column: x => x.IdUsuario,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Permissoes_Codigo",
                table: "Permissoes",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UsuariosPermissoes_IdPermissao",
                table: "UsuariosPermissoes",
                column: "IdPermissao");

            migrationBuilder.CreateIndex(
                name: "IX_UsuariosPermissoes_IdUnidadeEstoque",
                table: "UsuariosPermissoes",
                column: "IdUnidadeEstoque");

            migrationBuilder.CreateIndex(
                name: "IX_UsuariosPermissoes_IdUsuario_IdPermissao_IdUnidadeEstoque",
                table: "UsuariosPermissoes",
                columns: new[] { "IdUsuario", "IdPermissao", "IdUnidadeEstoque" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UsuariosPermissoes");

            migrationBuilder.DropTable(
                name: "Permissoes");
        }
    }
}
