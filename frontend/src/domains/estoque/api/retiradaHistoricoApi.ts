import { isAxiosError } from 'axios';
import { obterClienteHttp } from '../../../infrastructure/http/clienteHttpSingleton';
import { ErroApi } from '../../../infrastructure/http/erroApi';
import { MSG_ERRO } from '../../../shared/constants/mensagensErroUsuario';
import { isRespostaErroApi } from '../../../shared/types/respostaErroApi';
import { montarQueryString } from '../../../shared/utils/montarQueryString';
import {
  dispararDownloadBlob,
  extrairNomeArquivoContentDisposition,
} from '../components/historicoRetiradas/historicoRetiradasExport';
import type {
  RetiradaHistoricoFiltroDto,
  RetiradaHistoricoListaPaginadaDto,
  RetiradaPaginacaoDto,
} from '../types/tiposEstoque';

const PADRAO: Required<Pick<RetiradaPaginacaoDto, 'pageNumber' | 'pageSize'>> & {
  ordemDataAscendente?: undefined;
} = { pageNumber: 1, pageSize: 20 };

function paramsFiltro(f: RetiradaHistoricoFiltroDto): Record<string, string | number | undefined> {
  return {
    periodoRapido: f.periodoRapido,
    dataInicioUtc: f.dataInicioUtc,
    dataFimUtc: f.dataFimUtc,
    idUsuarioRetirante:
      f.idUsuarioRetirante != null && f.idUsuarioRetirante > 0 ? f.idUsuarioRetirante : undefined,
    idUsuarioRecebedor:
      f.idUsuarioRecebedor != null && f.idUsuarioRecebedor > 0 ? f.idUsuarioRecebedor : undefined,
    termoBusca: f.termoBusca?.trim() || undefined,
  };
}

/**
 * Lista paginada server-side para auditoria; totais sempre coerentes com os mesmos filtros no backend.
 */
export async function consultarHistoricoRetiradasApi(
  filtro: RetiradaHistoricoFiltroDto,
  paginacao?: RetiradaPaginacaoDto,
): Promise<RetiradaHistoricoListaPaginadaDto> {
  const cliente = obterClienteHttp();
  const qs = montarQueryString({
    ...paramsFiltro(filtro),
    pageNumber: paginacao?.pageNumber ?? PADRAO.pageNumber,
    pageSize: paginacao?.pageSize ?? PADRAO.pageSize,
    ordemDataAscendente:
      paginacao?.ordemDataAscendente === true ? true : undefined,
  });
  const { data } = await cliente.get<RetiradaHistoricoListaPaginadaDto>(`/api/RetiradaEstoque/historico${qs}`);
  return data;
}

export type FormatoExportacaoHistoricoRetiradas = 'xlsx' | 'csv';

async function exportarHistoricoRetiradasApi(
  filtro: RetiradaHistoricoFiltroDto,
  formato: FormatoExportacaoHistoricoRetiradas,
  ordemDataAscendente?: boolean,
): Promise<void> {
  const cliente = obterClienteHttp();
  const qs = montarQueryString({
    ...paramsFiltro(filtro),
    ordemDataAscendente: ordemDataAscendente === true ? true : undefined,
  });
  const caminho =
    formato === 'xlsx'
      ? `/api/RetiradaEstoque/historico/exportar/xlsx${qs}`
      : `/api/RetiradaEstoque/historico/exportar/csv${qs}`;

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
    const fallback = `retiradas-estoque-${new Date().toISOString().slice(0, 10)}.${formato}`;
    dispararDownloadBlob(blob, nomeHeader ?? fallback);
  } catch (erro) {
    throw await mapearErroExportacao(erro);
  }
}

export function exportarHistoricoRetiradasXlsxApi(
  filtro: RetiradaHistoricoFiltroDto,
  ordemDataAscendente?: boolean,
): Promise<void> {
  return exportarHistoricoRetiradasApi(filtro, 'xlsx', ordemDataAscendente);
}

export function exportarHistoricoRetiradasCsvApi(
  filtro: RetiradaHistoricoFiltroDto,
  ordemDataAscendente?: boolean,
): Promise<void> {
  return exportarHistoricoRetiradasApi(filtro, 'csv', ordemDataAscendente);
}

async function mapearErroExportacao(erro: unknown): Promise<ErroApi> {
  if (!isAxiosError(erro) || !(erro.response?.data instanceof Blob)) {
    return erro instanceof ErroApi
      ? erro
      : new ErroApi(MSG_ERRO.exportacaoHistorico, 0);
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

  if (status === 400) {
    return new ErroApi(MSG_ERRO.exportacaoFiltros, status);
  }

  return new ErroApi(MSG_ERRO.exportacaoArquivo, status);
}
