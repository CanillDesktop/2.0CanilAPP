import axios, { type AxiosInstance } from 'axios';
import { urlBaseApi } from '../config/variaveisAmbiente';
import { ErroApi } from './erroApi';
import type { RespostaErroApi, RespostaErroValidacaoApi } from '../../shared/types/respostaErroApi';
import { isRespostaErroApi, isRespostaErroValidacaoApi } from '../../shared/types/respostaErroApi';
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
      const dados: unknown = erro.response?.data;

      let mensagem = 'Falha na requisição';
      let erros;

      if (dados && isRespostaErroValidacaoApi(dados)) {
        mensagem = 'Ocorreram erros de validação';
        erros = (dados as RespostaErroValidacaoApi).errors;
      } else if (dados && isRespostaErroApi(dados)) {
        mensagem = (dados as RespostaErroApi).details;
      } else {
        mensagem = erro.message;
      }

      if (status === 403) {
        mensagem = 'Você não tem permissão para acessar este recurso.';
      }
      return Promise.reject(new ErroApi(mensagem, status, dados, erros));
    },
  );

  return cliente;
}
