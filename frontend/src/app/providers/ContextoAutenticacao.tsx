import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { UsuarioSessao } from '../../shared/types/usuarioSessao';
import { obterAccessToken, obterUsuarioArmazenado } from '../../shared/services/armazenamentoSessao';
import { servicoAutenticacao } from '../../domains/autenticacao/services/servicoAutenticacao';

type ContextoAutenticacaoValor = {
  autenticado: boolean;
  usuario: UsuarioSessao | null;
  recarregarSessao: () => void;
  sair: () => void;
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

  const sair = useCallback(() => {
    servicoAutenticacao.sair();
    setSessao({ autenticado: false, usuario: null });
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
