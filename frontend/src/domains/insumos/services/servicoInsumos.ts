import {
  atualizarInsumoApi,
  criarInsumoApi,
  excluirInsumoApi,
  listarInsumosPaginadosApi,
  obterInsumoPorIdApi,
} from '../api/insumosApi';
import type {
  InsumoCadastroDto,
  InsumoFiltro,
  InsumoLeituraDto,
  InsumoPaginacaoDto,
  InsumosListaPaginadaDto,
} from '../types/tiposInsumos';

export const servicoInsumos = {
  listarPaginado(filtro?: InsumoFiltro, paginacao?: InsumoPaginacaoDto): Promise<InsumosListaPaginadaDto> {
    return listarInsumosPaginadosApi(filtro, paginacao);
  },
  obterPorId(id: number): Promise<InsumoLeituraDto> {
    return obterInsumoPorIdApi(id);
  },
  criar(dto: InsumoCadastroDto): Promise<void> {
    return criarInsumoApi(dto);
  },
  atualizar(dto: InsumoCadastroDto): Promise<void> {
    return atualizarInsumoApi(dto);
  },
  excluir(id: number): Promise<void> {
    return excluirInsumoApi(id);
  },
};
