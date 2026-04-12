import { Navigate, useLocation } from 'react-router-dom';
import { useAutenticacao } from '../../../app/providers/ContextoAutenticacao';
import { FormularioLogin } from '../components/FormularioLogin';

export function PaginaLogin() {
  const { autenticado, recarregarSessao } = useAutenticacao();
  const local = useLocation();
  const destino = (local.state as { de?: string } | null)?.de ?? '/';

  if (autenticado) return <Navigate to={destino} replace />;

  return (
    <main className="pagina-centrada">
      <FormularioLogin aoAutenticar={recarregarSessao} />
    </main>
  );
}
