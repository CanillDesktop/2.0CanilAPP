import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAutenticacao } from '../../app/providers/ContextoAutenticacao';

/**
 * Garante que apenas usuários autenticados acessem rotas filhas.
 */
export function RotaProtegida() {
  const { autenticado } = useAutenticacao();
  const local = useLocation();

  if (!autenticado) {
    const retorno = `${local.pathname}${local.search}`;
    return <Navigate to="/login" replace state={{ de: retorno }} />;
  }

  return <Outlet />;
}
