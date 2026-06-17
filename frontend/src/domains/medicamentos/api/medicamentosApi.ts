import { obterClienteHttp } from '../../../infrastructure/http/clienteHttpSingleton';
import { montarQueryString } from '../../../shared/utils/montarQueryString';
import {
  montarParamsPaginacao,
  normalizarStatusEstoqueQuery,
} from '../../../shared/utils/listaItemComEstoqueApi';
import type {
  MedicamentoCadastroDto,
  MedicamentoFiltro,
  MedicamentoLeituraDto,
  MedicamentoPaginacaoDto,
  MedicamentosListaPaginadaDto,
} from '../types/tiposMedicamentos';

function normalizarParamsFiltro(filtro?: MedicamentoFiltro): Record<string, string | number | undefined> {
  if (!filtro) return {};
  const { statusEstoque, termo, prioridade, publicoAlvo, dataEntrega, dataValidade } = filtro;
  return {
    termo: termo?.trim() || undefined,
    prioridade,
    publicoAlvo,
    dataEntrega,
    dataValidade,
    statusEstoque: normalizarStatusEstoqueQuery(statusEstoque),
  };
}

/**
 * Lista medicamentos com paginação e metadados server-side (`totalCount`, `resumo`, etc.).
 */
export async function listarMedicamentosPaginadosApi(
  filtro?: MedicamentoFiltro,
  paginacao?: MedicamentoPaginacaoDto,
): Promise<MedicamentosListaPaginadaDto> {
  const cliente = obterClienteHttp();
  const params: Record<string, string | number | undefined> = {
    ...montarParamsPaginacao(paginacao),
    ...normalizarParamsFiltro(filtro),
  };
  const qs = montarQueryString(params);
  const { data } = await cliente.get<MedicamentosListaPaginadaDto>(`/api/Medicamentos${qs}`);
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
