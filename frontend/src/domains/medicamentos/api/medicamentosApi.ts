import { obterClienteHttp } from '../../../infrastructure/http/clienteHttpSingleton';
import { montarQueryString } from '../../../shared/utils/montarQueryString';
import type { MedicamentoCadastroDto, MedicamentoLeituraDto, MedicamentosFiltroDto } from '../types/tiposMedicamentos';

export async function listarMedicamentosApi(filtro?: MedicamentosFiltroDto): Promise<MedicamentoLeituraDto[]> {
  const cliente = obterClienteHttp();
  const qs = filtro ? montarQueryString(filtro as Record<string, string | number | undefined>) : '';
  const { data } = await cliente.get<MedicamentoLeituraDto[]>(`/api/Medicamentos${qs}`);
  return data;
}

export async function obterMedicamentoPorIdApi(id: number): Promise<MedicamentoLeituraDto> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.get<MedicamentoLeituraDto>(`/api/Medicamentos/${id}`);
  return data;
}

export async function criarMedicamentoApi(dto: MedicamentoCadastroDto): Promise<void> {
  const cliente = obterClienteHttp();
  await cliente.post('/api/Medicamentos', dto);
}

export async function atualizarMedicamentoApi(dto: MedicamentoCadastroDto): Promise<void> {
  const cliente = obterClienteHttp();
  await cliente.put('/api/Medicamentos', dto);
}

export async function excluirMedicamentoApi(id: number): Promise<void> {
  const cliente = obterClienteHttp();
  await cliente.delete(`/api/Medicamentos/${id}`);
}
