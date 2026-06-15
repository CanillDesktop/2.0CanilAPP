import {
  atualizarMedicamentoApi,
  criarMedicamentoApi,
  excluirMedicamentoApi,
  listarMedicamentosPaginadosApi,
  obterMedicamentoPorIdApi,
} from '../api/medicamentosApi';
import type {
  MedicamentoCadastroDto,
  MedicamentoFiltro,
  MedicamentoLeituraDto,
  MedicamentoPaginacaoDto,
  MedicamentosListaPaginadaDto,
} from '../types/tiposMedicamentos';

export const servicoMedicamentos = {
  listarPaginado(
    filtro?: MedicamentoFiltro,
    paginacao?: MedicamentoPaginacaoDto,
  ): Promise<MedicamentosListaPaginadaDto> {
    return listarMedicamentosPaginadosApi(filtro, paginacao);
  },
  obterPorId(id: number): Promise<MedicamentoLeituraDto> {
    return obterMedicamentoPorIdApi(id);
  },
  criar(dto: MedicamentoCadastroDto): Promise<void> {
    return criarMedicamentoApi(dto);
  },
  atualizar(dto: MedicamentoCadastroDto): Promise<void> {
    return atualizarMedicamentoApi(dto);
  },
  excluir(id: number): Promise<void> {
    return excluirMedicamentoApi(id);
  },
};
