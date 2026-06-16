/** Mensagens amigáveis exibidas na interface (português brasileiro). */
export const MSG_ERRO = {
  rede: 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.',
  timeout: 'A operação demorou demais. Tente novamente em instantes.',
  inesperado: 'Ocorreu um erro inesperado. Tente novamente.',
  operacao: 'Não foi possível completar a operação. Tente novamente.',
  validacaoResumo: 'Corrija os campos destacados abaixo.',
  semPermissao: 'Você não tem permissão para acessar este recurso.',
  login401: 'E-mail ou senha incorretos. Verifique os dados e tente novamente.',
  loginIncompleto: 'Não foi possível concluir o login. Tente novamente; se persistir, contate o suporte.',
  naoEncontrado: 'Registro não encontrado. Atualize a página e tente novamente.',
  servidor: 'Ocorreu um problema no servidor. Tente novamente em instantes.',
  carregarEstoque: 'Não foi possível carregar o estoque. Atualize a página e tente novamente.',
  retirada: 'Não foi possível registrar a retirada. Verifique os dados e tente novamente.',
  lote: 'Não foi possível salvar o lote. Verifique os dados e tente novamente.',
  excluirProduto: 'Não foi possível excluir o produto. Tente novamente.',
  excluirMedicamento: 'Não foi possível excluir o medicamento. Tente novamente.',
  excluirInsumo: 'Não foi possível excluir o insumo. Tente novamente.',
  exportacaoHistorico: 'Não foi possível exportar o histórico de retiradas. Tente novamente.',
  exportacaoFiltros: 'Não foi possível exportar com os filtros atuais. Refine o período ou reduza o volume de dados.',
  exportacaoArquivo: 'Não foi possível gerar o arquivo. Tente novamente em instantes.',
  logoutParcial: 'Você saiu deste dispositivo, mas não foi possível confirmar o encerramento no servidor.',
  sessaoEncerrada: 'Sessão encerrada com sucesso.',
  sessaoExpirada: 'Sua sessão expirou. Faça login novamente para continuar.',
} as const;

export type ResultadoMutacao<T = void> = { ok: true; dados?: T } | { ok: false; mensagem: string };
