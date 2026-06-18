import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { transformarErroAxios } from '../../../infrastructure/http/transformarErroAxios';
import { obterAccessToken } from '../../../shared/services/armazenamentoSessao';
import {
  encerrarSessaoERedirecionarParaLogin,
  tentarRenovarAccessToken,
} from '../services/gerenciadorRenovacaoSessao';

type ConfigComRetry = InternalAxiosRequestConfig & {
  _retryAposRenovacao?: boolean;
};

const ROTAS_SEM_RENOVACAO = ['/api/Auth/login', '/api/Auth/refresh', '/api/Auth/logout'];

const clientesConfigurados = new WeakSet<AxiosInstance>();

function caminhoDaRequisicao(url?: string): string {
  if (!url) return '';
  const semQuery = url.split('?')[0] ?? url;
  if (semQuery.startsWith('http://') || semQuery.startsWith('https://')) {
    try {
      return new URL(semQuery).pathname;
    } catch {
      return semQuery;
    }
  }
  return semQuery;
}

function deveIgnorarRenovacaoAutomatica(url?: string): boolean {
  const caminho = caminhoDaRequisicao(url);
  return ROTAS_SEM_RENOVACAO.some((rota) => caminho.endsWith(rota));
}

function deveEncerrarSessaoPor401(config: ConfigComRetry | undefined, status?: number): boolean {
  if (status !== 401 || !config) return false;
  if (deveIgnorarRenovacaoAutomatica(config.url)) return false;
  return config._retryAposRenovacao === true;
}

async function tratar401ComRenovacao(
  cliente: AxiosInstance,
  erro: AxiosError,
  config: ConfigComRetry,
): Promise<unknown> {
  if (config._retryAposRenovacao) {
    encerrarSessaoERedirecionarParaLogin();
    throw erro;
  }

  const renovado = await tentarRenovarAccessToken();
  if (!renovado) {
    encerrarSessaoERedirecionarParaLogin();
    throw erro;
  }

  config._retryAposRenovacao = true;
  const token = obterAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return cliente.request(config);
}

/**
 * Pipeline único de resposta: 401 → refresh → retry → ErroApi.
 * Evita ambiguidade de ordem entre múltiplos interceptadores do Axios.
 */
export function configurarInterceptadorRenovacaoSessao(cliente: AxiosInstance): void {
  if (clientesConfigurados.has(cliente)) return;
  clientesConfigurados.add(cliente);

  cliente.interceptors.response.use(
    (resposta) => resposta,
    async (erro: AxiosError) => {
      const config = erro.config as ConfigComRetry | undefined;
      const status = erro.response?.status;

      try {
        if (status === 401 && config && !deveIgnorarRenovacaoAutomatica(config.url)) {
          return await tratar401ComRenovacao(cliente, erro, config);
        }

        if (deveEncerrarSessaoPor401(config, status)) {
          encerrarSessaoERedirecionarParaLogin();
        }
      } catch (erroRenovacao) {
        return Promise.reject(await transformarErroAxios(erroRenovacao as AxiosError));
      }

      return Promise.reject(await transformarErroAxios(erro));
    },
  );
}
