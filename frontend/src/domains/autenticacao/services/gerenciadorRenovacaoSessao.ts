import { atualizarAccessToken, limparSessao } from '../../../shared/services/armazenamentoSessao';
import { solicitarRenovacaoTokenDiretoApi } from '../api/renovacaoTokenApi';

type OuvinteSessaoEncerrada = () => void;

let promessaRenovacao: Promise<boolean> | null = null;
let encerrandoSessao = false;
let ouvinteSessaoEncerrada: OuvinteSessaoEncerrada | null = null;

export function registrarOuvinteSessaoEncerrada(ouvinte: OuvinteSessaoEncerrada | null): void {
  ouvinteSessaoEncerrada = ouvinte;
}

/**
 * Single-flight: várias requisições 401 simultâneas compartilham uma única tentativa de refresh.
 */
export function tentarRenovarAccessToken(): Promise<boolean> {
  if (!promessaRenovacao) {
    promessaRenovacao = executarRenovacaoAccessToken().finally(() => {
      promessaRenovacao = null;
    });
  }
  return promessaRenovacao;
}

/** Extrai o access token da resposta do endpoint de refresh. */
function extrairAccessTokenResposta(data: unknown): string | null {
  if (typeof data === 'string' && data.trim().length > 0) {
    return data.trim();
  }

  if (data && typeof data === 'object') {
    const candidato = (data as { accessToken?: unknown }).accessToken;
    if (typeof candidato === 'string' && candidato.trim().length > 0) {
      return candidato.trim();
    }
  }

  return null;
}

async function executarRenovacaoAccessToken(): Promise<boolean> {
  try {
    const resposta = await solicitarRenovacaoTokenDiretoApi();
    const accessToken = extrairAccessTokenResposta(resposta);
    if (!accessToken) return false;
    atualizarAccessToken(accessToken);
    return true;
  } catch {
    return false;
  }
}

/** Limpa sessão local e redireciona ao login uma única vez, mesmo com vários 401 em paralelo. */
export function encerrarSessaoERedirecionarParaLogin(): void {
  if (encerrandoSessao) return;
  encerrandoSessao = true;

  limparSessao();
  ouvinteSessaoEncerrada?.();

  if (window.location.pathname === '/login') {
    return;
  }

  const retorno = `${window.location.pathname}${window.location.search}`;
  const params = new URLSearchParams({
    de: retorno,
    motivo: 'sessao-expirada',
  });
  window.location.replace(`/login?${params.toString()}`);
}

/** Permite novo encerramento após o usuário voltar à tela de login. */
export function redefinirEstadoEncerramentoSessao(): void {
  encerrandoSessao = false;
}
