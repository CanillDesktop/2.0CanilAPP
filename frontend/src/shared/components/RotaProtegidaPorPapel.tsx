import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAutenticacao } from '../../app/providers/ContextoAutenticacao';
import { mapearPapelUsuario, type PapelUsuarioApp } from '../types/papelUsuario';

type Props = {
  roles: PapelUsuarioApp[];
};

/**
 * Exige autenticação e um dos papéis informados. Caso contrário, envia para /403.
 */
export function RotaProtegidaPorPapel({ roles }: Props) {
  const { autenticado, usuario } = useAutenticacao();
  const local = useLocation();

  if (!autenticado) {
    const retorno = `${local.pathname}${local.search}`;
    return <Navigate to="/login" replace state={{ de: retorno }} />;
  }

  const papel = mapearPapelUsuario(usuario?.permissao);
  if (!roles.includes(papel)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
