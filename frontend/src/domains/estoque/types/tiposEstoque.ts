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
