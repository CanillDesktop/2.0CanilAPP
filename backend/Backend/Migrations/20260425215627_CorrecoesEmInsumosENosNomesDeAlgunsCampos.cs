using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class CorrecoesEmInsumosENosNomesDeAlgunsCampos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Insumos_ItensBase_IdItem",
                table: "Insumos");

            migrationBuilder.DropForeignKey(
                name: "FK_ItensEstoque_ItensBase_IdItem",
                table: "ItensEstoque");

            migrationBuilder.DropForeignKey(
                name: "FK_ItensNivelEstoque_ItensBase_IdItem",
                table: "ItensNivelEstoque");

            migrationBuilder.DropForeignKey(
                name: "FK_Medicamentos_ItensBase_IdItem",
                table: "Medicamentos");

            migrationBuilder.DropForeignKey(
                name: "FK_Produtos_ItensBase_IdItem",
                table: "Produtos");

            migrationBuilder.DropColumn(
                name: "DataHoraAtualizacao",
                table: "RetiradaEstoque");

            migrationBuilder.DropColumn(
                name: "DataHoraCriacao",
                table: "RetiradaEstoque");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "RetiradaEstoque");

            migrationBuilder.RenameColumn(
                name: "NomeItem",
                table: "RetiradaEstoque",
                newName: "NomeOuDescricaoSimples");

            migrationBuilder.RenameColumn(
                name: "CodItem",
                table: "RetiradaEstoque",
                newName: "Codigo");

            migrationBuilder.RenameColumn(
                name: "IdRetirada",
                table: "RetiradaEstoque",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "CodProduto",
                table: "Produtos",
                newName: "Codigo");

            migrationBuilder.RenameColumn(
                name: "IdItem",
                table: "Produtos",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "DescricaoMedicamento",
                table: "Medicamentos",
                newName: "Descricao");

            migrationBuilder.RenameColumn(
                name: "CodMedicamento",
                table: "Medicamentos",
                newName: "Codigo");

            migrationBuilder.RenameColumn(
                name: "IdItem",
                table: "Medicamentos",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "IdItem",
                table: "ItensNivelEstoque",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "CodItem",
                table: "ItensEstoque",
                newName: "EditadorPor");

            migrationBuilder.RenameColumn(
                name: "IdItem",
                table: "ItensEstoque",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "IdItem",
                table: "ItensBase",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "CodInsumo",
                table: "Insumos",
                newName: "Codigo");

            migrationBuilder.RenameColumn(
                name: "IdItem",
                table: "Insumos",
                newName: "Id");

            migrationBuilder.AddColumn<string>(
                name: "EditadorPor",
                table: "Usuarios",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "DescricaoSimples",
                table: "Produtos",
                type: "TEXT",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "ItensNivelEstoque",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .Annotation("Sqlite:Autoincrement", true);

            migrationBuilder.AddColumn<string>(
                name: "EditadorPor",
                table: "ItensNivelEstoque",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Codigo",
                table: "ItensEstoque",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "EditadorPor",
                table: "ItensBase",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "DescricaoSimplificada",
                table: "Insumos",
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

            migrationBuilder.AddForeignKey(
                name: "FK_Insumos_ItensBase_Id",
                table: "Insumos",
                column: "Id",
                principalTable: "ItensBase",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ItensEstoque_ItensBase_Id",
                table: "ItensEstoque",
                column: "Id",
                principalTable: "ItensBase",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ItensNivelEstoque_ItensBase_Id",
                table: "ItensNivelEstoque",
                column: "Id",
                principalTable: "ItensBase",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Medicamentos_ItensBase_Id",
                table: "Medicamentos",
                column: "Id",
                principalTable: "ItensBase",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Produtos_ItensBase_Id",
                table: "Produtos",
                column: "Id",
                principalTable: "ItensBase",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Insumos_ItensBase_Id",
                table: "Insumos");

            migrationBuilder.DropForeignKey(
                name: "FK_ItensEstoque_ItensBase_Id",
                table: "ItensEstoque");

            migrationBuilder.DropForeignKey(
                name: "FK_ItensNivelEstoque_ItensBase_Id",
                table: "ItensNivelEstoque");

            migrationBuilder.DropForeignKey(
                name: "FK_Medicamentos_ItensBase_Id",
                table: "Medicamentos");

            migrationBuilder.DropForeignKey(
                name: "FK_Produtos_ItensBase_Id",
                table: "Produtos");

            migrationBuilder.DropColumn(
                name: "EditadorPor",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "EditadorPor",
                table: "ItensNivelEstoque");

            migrationBuilder.DropColumn(
                name: "Codigo",
                table: "ItensEstoque");

            migrationBuilder.DropColumn(
                name: "EditadorPor",
                table: "ItensBase");

            migrationBuilder.RenameColumn(
                name: "NomeOuDescricaoSimples",
                table: "RetiradaEstoque",
                newName: "NomeItem");

            migrationBuilder.RenameColumn(
                name: "Codigo",
                table: "RetiradaEstoque",
                newName: "CodItem");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "RetiradaEstoque",
                newName: "IdRetirada");

            migrationBuilder.RenameColumn(
                name: "Codigo",
                table: "Produtos",
                newName: "CodProduto");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "Produtos",
                newName: "IdItem");

            migrationBuilder.RenameColumn(
                name: "Descricao",
                table: "Medicamentos",
                newName: "DescricaoMedicamento");

            migrationBuilder.RenameColumn(
                name: "Codigo",
                table: "Medicamentos",
                newName: "CodMedicamento");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "Medicamentos",
                newName: "IdItem");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "ItensNivelEstoque",
                newName: "IdItem");

            migrationBuilder.RenameColumn(
                name: "EditadorPor",
                table: "ItensEstoque",
                newName: "CodItem");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "ItensEstoque",
                newName: "IdItem");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "ItensBase",
                newName: "IdItem");

            migrationBuilder.RenameColumn(
                name: "Codigo",
                table: "Insumos",
                newName: "CodInsumo");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "Insumos",
                newName: "IdItem");

            migrationBuilder.AddColumn<DateTime>(
                name: "DataHoraAtualizacao",
                table: "RetiradaEstoque",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2026, 4, 23, 3, 59, 25, 53, DateTimeKind.Utc).AddTicks(4206));

            migrationBuilder.AddColumn<DateTime>(
                name: "DataHoraCriacao",
                table: "RetiradaEstoque",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(2026, 4, 23, 3, 59, 25, 53, DateTimeKind.Utc).AddTicks(3913));

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "RetiradaEstoque",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AlterColumn<string>(
                name: "DescricaoSimples",
                table: "Produtos",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<int>(
                name: "IdItem",
                table: "ItensNivelEstoque",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .OldAnnotation("Sqlite:Autoincrement", true);

            migrationBuilder.AlterColumn<string>(
                name: "DescricaoSimplificada",
                table: "Insumos",
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

            migrationBuilder.AddForeignKey(
                name: "FK_Insumos_ItensBase_IdItem",
                table: "Insumos",
                column: "IdItem",
                principalTable: "ItensBase",
                principalColumn: "IdItem",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ItensEstoque_ItensBase_IdItem",
                table: "ItensEstoque",
                column: "IdItem",
                principalTable: "ItensBase",
                principalColumn: "IdItem",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ItensNivelEstoque_ItensBase_IdItem",
                table: "ItensNivelEstoque",
                column: "IdItem",
                principalTable: "ItensBase",
                principalColumn: "IdItem",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Medicamentos_ItensBase_IdItem",
                table: "Medicamentos",
                column: "IdItem",
                principalTable: "ItensBase",
                principalColumn: "IdItem",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Produtos_ItensBase_IdItem",
                table: "Produtos",
                column: "IdItem",
                principalTable: "ItensBase",
                principalColumn: "IdItem",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
