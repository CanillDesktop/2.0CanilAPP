import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { EstadoNavegacaoListagem } from '../types/navegacaoListagem';

type SnackbarEstado = { open: boolean; mensagem: string; tipo: 'success' | 'error' };

export function useSnackbarRetornoListagem(estadoInicial: SnackbarEstado) {
  const location = useLocation();
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState(estadoInicial);

  useEffect(() => {
    const state = location.state as EstadoNavegacaoListagem | null;
    if (!state?.mensagemSucesso) return;

    setSnackbar({ open: true, mensagem: state.mensagemSucesso, tipo: 'success' });
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  return { snackbar, setSnackbar };
}
