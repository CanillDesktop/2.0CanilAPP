import { obterClienteHttp } from '../../../infrastructure/http/clienteHttpSingleton';
import type {
  CargoAtualizacaoDto,
  CargoCadastroDto,
  CargoLeituraDto,
  CargoPermissoesEditorDto,
  CargoPermissoesSalvarDto,
} from '../types/tiposCargos';

export async function listarCargosApi(): Promise<CargoLeituraDto[]> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.get<CargoLeituraDto[]>('/api/Cargos');
  return data;
}

export async function criarCargoApi(dto: CargoCadastroDto): Promise<CargoLeituraDto> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.post<CargoLeituraDto>('/api/Cargos', dto);
  return data;
}

export async function atualizarCargoApi(id: number, dto: CargoAtualizacaoDto): Promise<CargoLeituraDto> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.put<CargoLeituraDto>(`/api/Cargos/${id}`, dto);
  return data;
}

export async function excluirCargoApi(id: number): Promise<void> {
  const cliente = obterClienteHttp();
  await cliente.delete(`/api/Cargos/${id}`);
}

export async function obterPermissoesCargoApi(id: number): Promise<CargoPermissoesEditorDto> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.get<CargoPermissoesEditorDto>(`/api/Cargos/${id}/permissoes`);
  return data;
}

export async function salvarPermissoesCargoApi(id: number, dto: CargoPermissoesSalvarDto): Promise<void> {
  const cliente = obterClienteHttp();
  await cliente.put(`/api/Cargos/${id}/permissoes`, dto);
}
