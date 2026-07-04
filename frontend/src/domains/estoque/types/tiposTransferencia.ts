export type TransferenciaEstoqueItemDto = {
  idItem: number;
  lote: string;
  quantidade: number;
};

export type TransferenciaEstoqueCriacaoDto = {
  idUnidadeDestino: number;
  observacao?: string | null;
  itens: TransferenciaEstoqueItemDto[];
};

export type TransferenciaEstoqueItemLeituraDto = {
  idItem: number;
  codigo: string;
  nomeItem: string;
  lote: string;
  quantidade: number;
};

/** Perspectiva na unidade ativa: saída (origem) ou entrada (destino). */
export type TransferenciaTipoMovimento = 'Saida' | 'Entrada' | string;

export type TransferenciaEstoqueLeituraDto = {
  id: number;
  idUnidadeOrigem: number;
  unidadeOrigemNome: string;
  idUnidadeDestino: number;
  unidadeDestinoNome: string;
  status: string;
  /** Saida = enviada pela unidade ativa; Entrada = recebida/aguardando na unidade ativa. */
  tipoMovimento: TransferenciaTipoMovimento;
  dataTransferencia: string;
  usuarioEnvio: string;
  usuarioRecebimento?: string | null;
  observacao?: string | null;
  itens: TransferenciaEstoqueItemLeituraDto[];
};
