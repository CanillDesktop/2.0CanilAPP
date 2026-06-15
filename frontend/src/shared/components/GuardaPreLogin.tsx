import { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Navigate, Outlet } from 'react-router-dom';
import { useAutenticacao } from '../../app/providers/ContextoAutenticacao';
import { useTemaApp } from '../../app/providers/ContextoTemaApp';
import { obterVersaoCodigoAcessoApi } from '../../domains/autenticacao/api/codigoAcessoApi';
import {
  preLoginConcluido,
  versaoPreLoginValidada,
} from '../../domains/autenticacao/services/preLoginStorage';

type EstadoGate = 'verificando' | 'liberado' | 'bloqueado';

/**
 * Protege a tela de login/cadastro com o pré-login por código de acesso.
 *
 * - Sessão ativa (autenticado): segue direto (regra anterior preservada).
 * - Sem sessão: consulta a versão atual do código. Só libera se a versão
 *   validada localmente for igual à atual. Se o código mudou (versão diferente),
 *   exige o pré-login novamente, redirecionando para /codigo-acesso.
 */
export function GuardaPreLogin() {
  const { autenticado } = useAutenticacao();
  const { cores } = useTemaApp();
  const [estado, setEstado] = useState<EstadoGate>('verificando');

  useEffect(() => {
    if (autenticado) {
      setEstado('liberado');
      return;
    }

    let ativo = true;
    (async () => {
      try {
        const versaoAtual = await obterVersaoCodigoAcessoApi();
        if (!ativo) return;
        setEstado(preLoginConcluido(versaoAtual) ? 'liberado' : 'bloqueado');
      } catch {
        if (!ativo) return;
        // Sem conexão para verificar a versão: evita travar quem já passou pelo
        // pré-login antes (o login em si ainda dependerá do servidor).
        setEstado(versaoPreLoginValidada() ? 'liberado' : 'bloqueado');
      }
    })();

    return () => {
      ativo = false;
    };
  }, [autenticado]);

  if (autenticado) return <Outlet />;

  if (estado === 'verificando') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: cores.gradienteLogin,
        }}
      >
        <CircularProgress sx={{ color: cores.accent }} />
      </Box>
    );
  }

  if (estado === 'bloqueado') return <Navigate to="/codigo-acesso" replace />;

  return <Outlet />;
}
