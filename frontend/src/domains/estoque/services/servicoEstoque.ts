import {
  atualizarItemEstoqueApi,
  criarItemEstoqueApi,
  excluirItemEstoqueApi,
  obterItemEstoquePorIdApi,
  obterProximoLoteEstoqueApi,
} from '../api/estoqueItensApi';
import {
  consultarHistoricoRetiradasApi,
  exportarHistoricoRetiradasCsvApi,
  exportarHistoricoRetiradasXlsxApi,
} from '../api/retiradaHistoricoApi';
import { registrarRetiradaApi } from '../api/retiradaEstoqueApi';
import type {
  ItemEstoqueDto,
  ProximoLoteEstoqueDto,
  RetiradaEstoqueDto,
  RetiradaHistoricoFiltroDto,
  RetiradaHistoricoListaPaginadaDto,
  RetiradaPaginacaoDto,
} from '../types/tiposEstoque';

export const servicoEstoque = {
  obterItemPorId(id: number): Promise<ItemEstoqueDto> {
    return obterItemEstoquePorIdApi(id);
  },
  obterProximoLote(itemId: number): Promise<ProximoLoteEstoqueDto> {
    return obterProximoLoteEstoqueApi(itemId);
  },
  criarLote(dto: ItemEstoqueDto): Promise<ItemEstoqueDto> {
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
  consultarHistoricoRetiradas(
    filtro: RetiradaHistoricoFiltroDto,
    paginacao?: RetiradaPaginacaoDto,
  ): Promise<RetiradaHistoricoListaPaginadaDto> {
    return consultarHistoricoRetiradasApi(filtro, paginacao);
  },
  exportarHistoricoRetiradasXlsx(
    filtro: RetiradaHistoricoFiltroDto,
    ordemDataAscendente?: boolean,
  ): Promise<void> {
    return exportarHistoricoRetiradasXlsxApi(filtro, ordemDataAscendente);
  },
  exportarHistoricoRetiradasCsv(
    filtro: RetiradaHistoricoFiltroDto,
    ordemDataAscendente?: boolean,
  ): Promise<void> {
    return exportarHistoricoRetiradasCsvApi(filtro, ordemDataAscendente);
  },
};
