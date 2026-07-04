import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAutenticacao } from '../../app/providers/ContextoAutenticacao';
import { podeGerenciarCatalogoUnidadesMedida } from '../../domains/usuarios/utils/exibirPerfilUsuario';

/** Exige autenticação e permissão para gerenciar o catálogo de unidades de medida. */
export function RotaProtegidaCatalogoMedidas() {
  const { autenticado, usuario } = useAutenticacao();
  const local = useLocation();

  if (!autenticado) {
    const retorno = `${local.pathname}${local.search}`;
    return <Navigate to="/login" replace state={{ de: retorno }} />;
  }

  if (!podeGerenciarCatalogoUnidadesMedida(usuario)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
