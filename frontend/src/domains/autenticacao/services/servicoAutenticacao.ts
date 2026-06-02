import { solicitarLoginApi, solicitarRenovacaoTokenApi } from '../api/loginApi';
import { solicitarLogoutApi } from '../api/logoutApi';
import type { CredenciaisLogin, RespostaLogin } from '../types/tiposAutenticacao';
import {
  atualizarAccessToken,
  limparSessao,
  salvarSessao,
} from '../../../shared/services/armazenamentoSessao';
import { MSG_ERRO } from '../../../shared/constants/mensagensErroUsuario';

/**
 * Serviço de aplicação do domínio de autenticação (orquestra API + persistência de sessão).
 */
export const servicoAutenticacao = {
  async entrar(credenciais: CredenciaisLogin): Promise<RespostaLogin> {
    const resposta = await solicitarLoginApi(credenciais);
    const access = resposta.accessToken;
    const usuario = resposta.usuario;
    if (!access || !usuario) {
      throw new Error(MSG_ERRO.loginIncompleto);
    }
    salvarSessao(access, usuario);
    return resposta;
  },

  async sair(): Promise<{ confirmadoNoServidor: boolean }> {
    try {
      await solicitarLogoutApi();
      limparSessao();
      return { confirmadoNoServidor: true };
    } catch {
      limparSessao();
      return { confirmadoNoServidor: false };
    }
  },

  async renovarSePossivel(): Promise<boolean> {
    const accessToken = await solicitarRenovacaoTokenApi();
    if (!accessToken) return false;
    atualizarAccessToken(accessToken);
    return true;
  },
};
