import { isAxiosError } from 'axios';
import { obterClienteHttp } from '../../../infrastructure/http/clienteHttpSingleton';
import { ErroApi } from '../../../infrastructure/http/erroApi';
import { MSG_ERRO } from '../../../shared/constants/mensagensErroUsuario';
import { isRespostaErroApi } from '../../../shared/types/respostaErroApi';
import {
  dispararDownloadBlob,
  extrairNomeArquivoContentDisposition,
} from '../components/historicoRetiradas/historicoRetiradasExport';
import type {
  TransferenciaEstoqueCriacaoDto,
  TransferenciaEstoqueLeituraDto,
} from '../types/tiposTransferencia';

export async function listarTransferenciasEstoqueApi(): Promise<TransferenciaEstoqueLeituraDto[]> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.get<TransferenciaEstoqueLeituraDto[]>('/api/TransferenciasEstoque');
  return data;
}

export async function criarTransferenciaEstoqueApi(
  dto: TransferenciaEstoqueCriacaoDto,
): Promise<TransferenciaEstoqueLeituraDto> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.post<TransferenciaEstoqueLeituraDto>('/api/TransferenciasEstoque', dto);
  return data;
}

export async function receberTransferenciaEstoqueApi(id: number): Promise<TransferenciaEstoqueLeituraDto> {
  const cliente = obterClienteHttp();
  const { data } = await cliente.post<TransferenciaEstoqueLeituraDto>(`/api/TransferenciasEstoque/${id}/receber`);
  return data;
}

export type FormatoExportacaoTransferencias = 'xlsx' | 'csv';

async function exportarTransferenciasApi(formato: FormatoExportacaoTransferencias): Promise<void> {
  const cliente = obterClienteHttp();
  const caminho =
    formato === 'xlsx'
      ? '/api/TransferenciasEstoque/exportar/xlsx'
      : '/api/TransferenciasEstoque/exportar/csv';

  try {
    const resposta = await cliente.get<Blob>(caminho, {
      responseType: 'blob',
      timeout: 120_000,
    });

    const mime =
      formato === 'xlsx'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'text/csv;charset=utf-8';
    const blob = new Blob([resposta.data], { type: resposta.headers['content-type'] ?? mime });
    const nomeHeader = extrairNomeArquivoContentDisposition(resposta.headers['content-disposition']);
    const fallback = `transferencias-estoque-${new Date().toISOString().slice(0, 10)}.${formato}`;
    dispararDownloadBlob(blob, nomeHeader ?? fallback);
  } catch (erro) {
    throw await mapearErroExportacao(erro);
  }
}

export function exportarTransferenciasXlsxApi(): Promise<void> {
  return exportarTransferenciasApi('xlsx');
}

export function exportarTransferenciasCsvApi(): Promise<void> {
  return exportarTransferenciasApi('csv');
}

async function mapearErroExportacao(erro: unknown): Promise<ErroApi> {
  if (!isAxiosError(erro) || !(erro.response?.data instanceof Blob)) {
    return erro instanceof ErroApi ? erro : new ErroApi(MSG_ERRO.exportacaoArquivo, 0);
  }

  const status = erro.response.status ?? 0;
  try {
    const texto = await erro.response.data.text();
    const json: unknown = JSON.parse(texto);
    if (json != null && isRespostaErroApi(json)) {
      return new ErroApi(json.details || json.title, status, json);
    }
  } catch {
    // ignora parse
  }

  return new ErroApi(MSG_ERRO.exportacaoArquivo, status);
}
