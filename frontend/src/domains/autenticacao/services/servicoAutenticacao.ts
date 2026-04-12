import { solicitarLoginApi, solicitarRenovacaoTokenApi } from '../api/loginApi';
import type { CredenciaisLogin, RespostaLogin } from '../types/tiposAutenticacao';
import {
  atualizarTokens,
  limparSessao,
  obterRefreshToken,
  salvarSessao,
} from '../../../shared/services/armazenamentoSessao';

/**
 * Serviço de aplicação do domínio de autenticação (orquestra API + persistência de sessão).
 */
export const servicoAutenticacao = {
  async entrar(credenciais: CredenciaisLogin): Promise<RespostaLogin> {
    const resposta = await solicitarLoginApi(credenciais);
    const access = resposta.token?.accessToken;
    const refresh = resposta.token?.refreshToken;
    const usuario = resposta.usuario;
    if (!access || !refresh || !usuario) {
      throw new Error('Resposta de login incompleta.');
    }
    salvarSessao(access, refresh, usuario);
    return resposta;
  },

  sair(): void {
    limparSessao();
  },

  async renovarSePossivel(): Promise<boolean> {
    const refresh = obterRefreshToken();
    if (!refresh) return false;
    const token = await solicitarRenovacaoTokenApi(refresh);
    if (!token?.accessToken || !token.refreshToken) return false;
    atualizarTokens(token.accessToken, token.refreshToken);
    return true;
  },
};
