import {
  atualizarInsumoApi,
  criarInsumoApi,
  excluirInsumoApi,
  listarInsumosApi,
  obterInsumoPorIdApi,
} from '../api/insumosApi';
import type { InsumoCadastroDto, InsumoLeituraDto, InsumosFiltroDto } from '../types/tiposInsumos';

export const servicoInsumos = {
  listar(filtro?: InsumosFiltroDto): Promise<InsumoLeituraDto[]> {
    return listarInsumosApi(filtro);
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
