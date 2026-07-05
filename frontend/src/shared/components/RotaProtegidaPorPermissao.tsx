import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAutenticacao } from '../../app/providers/ContextoAutenticacao';
import { possuiPermissao } from '../utils/possuiPermissao';

type Props = {
  /** Basta possuir uma das permissões listadas. */
  permissoes: string[];
};

export function RotaProtegidaPorPermissao({ permissoes }: Props) {
  const { autenticado, usuario } = useAutenticacao();
  const local = useLocation();

  if (!autenticado) {
    const retorno = `${local.pathname}${local.search}`;
    return <Navigate to="/login" replace state={{ de: retorno }} />;
  }

  const autorizado = permissoes.some((codigo) => possuiPermissao(usuario, codigo));
  if (!autorizado) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
