/** Códigos estáveis de permissão (espelham PermissaoCodigos no backend). */
export const PERMISSAO = {
  sistemaAdministrador: 'sistema.administrador',
  usuariosListar: 'usuarios.listar',
  usuariosCriar: 'usuarios.criar',
  usuariosEditar: 'usuarios.editar',
  usuariosInativar: 'usuarios.inativar',
  usuariosReativar: 'usuarios.reativar',
  usuariosExcluir: 'usuarios.excluir',
  usuariosGerenciarVinculosUnidade: 'usuarios.gerenciar_vinculos_unidade',
  usuariosPermissoesGerenciar: 'usuarios.permissoes.gerenciar',
  usuariosSenhaVisualizar: 'usuarios.senha.visualizar',
  usuariosSenhaAlterar: 'usuarios.senha.alterar',
  codigoSegurancaEditar: 'codigo_seguranca.editar',
  unidadesMedidaGerenciar: 'unidades_medida.gerenciar',
  permissoesCatalogoVisualizar: 'permissoes.catalogo.visualizar',
  permissoesCatalogoGerenciar: 'permissoes.catalogo.gerenciar',
  cargosGerenciar: 'cargos.gerenciar',
  estoqueConsultar: 'estoque.consultar',
  estoqueEntrada: 'estoque.entrada',
  estoqueSaida: 'estoque.saida',
  estoqueTransferirEnviar: 'estoque.transferir_enviar',
  estoqueTransferirReceber: 'estoque.transferir_receber',
} as const;

export type CodigoPermissao = (typeof PERMISSAO)[keyof typeof PERMISSAO];
