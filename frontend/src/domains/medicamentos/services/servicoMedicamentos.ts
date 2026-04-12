import {
  atualizarMedicamentoApi,
  criarMedicamentoApi,
  excluirMedicamentoApi,
  listarMedicamentosApi,
  obterMedicamentoPorIdApi,
} from '../api/medicamentosApi';
import type { MedicamentoCadastroDto, MedicamentoLeituraDto, MedicamentosFiltroDto } from '../types/tiposMedicamentos';

export const servicoMedicamentos = {
  listar(filtro?: MedicamentosFiltroDto): Promise<MedicamentoLeituraDto[]> {
    return listarMedicamentosApi(filtro);
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
