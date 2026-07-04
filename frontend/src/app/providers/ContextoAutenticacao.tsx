import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { UsuarioSessao } from '../../shared/types/usuarioSessao';
import { obterAccessToken, obterUsuarioArmazenado } from '../../shared/services/armazenamentoSessao';
import { limparUnidadeAtivaId } from '../../shared/services/armazenamentoUnidadeEstoque';
import { servicoAutenticacao } from '../../domains/autenticacao/services/servicoAutenticacao';
import { registrarOuvinteSessaoEncerrada } from '../../domains/autenticacao/services/gerenciadorRenovacaoSessao';

type ContextoAutenticacaoValor = {
  autenticado: boolean;
  usuario: UsuarioSessao | null;
  recarregarSessao: () => void;
  sair: () => Promise<{ confirmadoNoServidor: boolean }>;
};

const ContextoAutenticacao = createContext<ContextoAutenticacaoValor | null>(null);

function lerSessaoAtual(): { autenticado: boolean; usuario: UsuarioSessao | null } {
  const token = obterAccessToken();
  const usuario = obterUsuarioArmazenado();
  return { autenticado: Boolean(token), usuario };
}

export function ProvedorAutenticacao({ children }: { children: ReactNode }) {
  const [{ autenticado, usuario }, setSessao] = useState(lerSessaoAtual);

  const recarregarSessao = useCallback(() => {
    setSessao(lerSessaoAtual());
  }, []);

  const sair = useCallback(async () => {
    const resultado = await servicoAutenticacao.sair();
    limparUnidadeAtivaId();
    setSessao({ autenticado: false, usuario: null });
    return resultado;
  }, []);

  useEffect(() => {
    registrarOuvinteSessaoEncerrada(() => {
      setSessao({ autenticado: false, usuario: null });
    });
    return () => registrarOuvinteSessaoEncerrada(null);
  }, []);

  const valor = useMemo(
    () => ({ autenticado, usuario, recarregarSessao, sair }),
    [autenticado, usuario, recarregarSessao, sair],
  );

  return <ContextoAutenticacao.Provider value={valor}>{children}</ContextoAutenticacao.Provider>;
}

export function useAutenticacao(): ContextoAutenticacaoValor {
  const ctx = useContext(ContextoAutenticacao);
  if (!ctx) throw new Error('useAutenticacao deve ser usado dentro de ProvedorAutenticacao.');
  return ctx;
}
