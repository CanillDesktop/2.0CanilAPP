namespace Backend.Models.Permissoes;

/// <summary>
/// Identificadores estáveis das permissões do sistema (persistidos na tabela Permissoes).
/// </summary>
public static class PermissaoCodigos
{
    public const string SistemaAdministrador = "sistema.administrador";

    public const string UsuariosListar = "usuarios.listar";
    public const string UsuariosCriar = "usuarios.criar";
    public const string UsuariosEditar = "usuarios.editar";
    public const string UsuariosInativar = "usuarios.inativar";
    public const string UsuariosReativar = "usuarios.reativar";
    public const string UsuariosExcluir = "usuarios.excluir";
    public const string UsuariosGerenciarVinculosUnidade = "usuarios.gerenciar_vinculos_unidade";
    public const string UsuariosPermissoesGerenciar = "usuarios.permissoes.gerenciar";
    public const string UsuariosSenhaVisualizar = "usuarios.senha.visualizar";
    public const string UsuariosSenhaAlterar = "usuarios.senha.alterar";

    public const string CodigoSegurancaEditar = "codigo_seguranca.editar";
    public const string UnidadesMedidaGerenciar = "unidades_medida.gerenciar";

    public const string PermissoesCatalogoVisualizar = "permissoes.catalogo.visualizar";
    public const string PermissoesCatalogoGerenciar = "permissoes.catalogo.gerenciar";

    public const string CargosGerenciar = "cargos.gerenciar";

    public const string EstoqueConsultar = "estoque.consultar";
    public const string EstoqueEntrada = "estoque.entrada";
    public const string EstoqueSaida = "estoque.saida";
    public const string EstoqueTransferirEnviar = "estoque.transferir_enviar";
    public const string EstoqueTransferirReceber = "estoque.transferir_receber";

    public static IReadOnlyList<string> Todas =>
    [
        SistemaAdministrador,
        UsuariosListar,
        UsuariosCriar,
        UsuariosEditar,
        UsuariosInativar,
        UsuariosReativar,
        UsuariosExcluir,
        UsuariosGerenciarVinculosUnidade,
        UsuariosPermissoesGerenciar,
        UsuariosSenhaVisualizar,
        UsuariosSenhaAlterar,
        CodigoSegurancaEditar,
        UnidadesMedidaGerenciar,
        PermissoesCatalogoVisualizar,
        PermissoesCatalogoGerenciar,
        CargosGerenciar,
        EstoqueConsultar,
        EstoqueEntrada,
        EstoqueSaida,
        EstoqueTransferirEnviar,
        EstoqueTransferirReceber,
    ];
}
