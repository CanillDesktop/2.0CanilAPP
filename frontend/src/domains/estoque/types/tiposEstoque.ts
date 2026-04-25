import type { ItemEstoqueDto } from '../../../shared/types/itemEstoque';

export type { ItemEstoqueDto };

export type RetiradaEstoqueDto = {
  idRetirada: number;
  codItem: string;
  nomeItem: string;
  lote: string;
  de: string;
  para: string;
  quantidade: number;
  dataHoraInsercaoRegistro: string;
};

export type RetiradaRequest = {
  loteId: string;
  quantidade: number;
  origem: string;
  destino: string;
};

export type RetiradaNavegacaoState = {
  produtoId: number;
  produtoNome: string;
  codItem: string;
  loteId: string;
  loteCodigo: string;
  quantidadeDisponivel: number;
  retornoRota?: string;
};
