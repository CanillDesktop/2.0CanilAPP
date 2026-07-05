import {
  atualizarCargoApi,
  criarCargoApi,
  excluirCargoApi,
  listarCargosApi,
  obterPermissoesCargoApi,
  salvarPermissoesCargoApi,
} from '../api/cargosApi';
import type {
  CargoAtualizacaoDto,
  CargoCadastroDto,
  CargoLeituraDto,
  CargoPermissoesEditorDto,
  CargoPermissoesSalvarDto,
} from '../types/tiposCargos';

export const servicoCargos = {
  listar(): Promise<CargoLeituraDto[]> {
    return listarCargosApi();
  },
  criar(dto: CargoCadastroDto): Promise<CargoLeituraDto> {
    return criarCargoApi(dto);
  },
  atualizar(id: number, dto: CargoAtualizacaoDto): Promise<CargoLeituraDto> {
    return atualizarCargoApi(id, dto);
  },
  excluir(id: number): Promise<void> {
    return excluirCargoApi(id);
  },
  obterPermissoes(id: number): Promise<CargoPermissoesEditorDto> {
    return obterPermissoesCargoApi(id);
  },
  salvarPermissoes(id: number, dto: CargoPermissoesSalvarDto): Promise<void> {
    return salvarPermissoesCargoApi(id, dto);
  },
};
