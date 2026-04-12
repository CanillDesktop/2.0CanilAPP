import {
  atualizarItemEstoqueApi,
  criarItemEstoqueApi,
  excluirItemEstoqueApi,
  obterItemEstoquePorIdApi,
} from '../api/estoqueItensApi';
import { registrarRetiradaApi } from '../api/retiradaEstoqueApi';
import type { ItemEstoqueDto, RetiradaEstoqueDto } from '../types/tiposEstoque';

export const servicoEstoque = {
  obterItemPorId(id: number): Promise<ItemEstoqueDto> {
    return obterItemEstoquePorIdApi(id);
  },
  criarLote(dto: ItemEstoqueDto): Promise<void> {
    return criarItemEstoqueApi(dto);
  },
  atualizarLote(lote: string, dto: ItemEstoqueDto): Promise<void> {
    return atualizarItemEstoqueApi(lote, dto);
  },
  excluirLote(lote: string): Promise<void> {
    return excluirItemEstoqueApi(lote);
  },
  registrarRetirada(dto: RetiradaEstoqueDto): Promise<void> {
    return registrarRetiradaApi(dto);
  },
};
