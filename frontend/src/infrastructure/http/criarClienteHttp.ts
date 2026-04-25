import axios, { type AxiosInstance } from 'axios';
import { urlBaseApi } from '../config/variaveisAmbiente';
import { ErroApi } from './erroApi';
import type { RespostaErroApi } from '../../shared/types/respostaErroApi';
import { obterAccessToken } from '../../shared/services/armazenamentoSessao';

/**
 * Fábrica do cliente HTTP centralizado (Axios).
 * Responsável por base URL, credenciais e tratamento básico de falhas.
 */
export function criarClienteHttp(): AxiosInstance {
  /** Só envia credenciais cross-origin quando a API é outra origem (`VITE_URL_BASE_API`). Com base vazia + proxy do Vite, o browser fala só com :5173 (mesma origem) e CORS não se aplica. */
  const credenciaisCrossOrigin = urlBaseApi.trim().length > 0;

  const cliente = axios.create({
    baseURL: urlBaseApi,
    headers: { 'Content-Type': 'application/json' },
    timeout: 30_000,
    withCredentials: credenciaisCrossOrigin
  });

  cliente.interceptors.request.use((config) => {
    const token = obterAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  cliente.interceptors.response.use(
    (resposta) => resposta,
    (erro) => {
      const status = erro.response?.status ?? 0;
      const dados = erro.response?.data as RespostaErroApi | undefined;
      let mensagem =
        dados && typeof dados.details === 'string'
          ? dados.details
          : erro.message ?? 'Falha na requisição';
      if (status === 403) {
        mensagem = 'Você não tem permissão para acessar este recurso.';
      }
      return Promise.reject(new ErroApi(mensagem, status, dados ?? erro.response?.data));
    },
  );

  return cliente;
}
