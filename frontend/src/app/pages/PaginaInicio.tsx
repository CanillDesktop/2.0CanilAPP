import { Link } from 'react-router-dom';
import { useAutenticacao } from '../providers/ContextoAutenticacao';

export function PaginaInicio() {
  const { autenticado, usuario } = useAutenticacao();

  return (
    <section>
      <h1>CanilApp — painel web</h1>
      {autenticado ? (
        <>
          <p>
            Olá, <strong>{usuario?.nome}</strong>. Use o menu superior para navegar entre os módulos.
          </p>
          <ul className="lista-links">
            <li>
              <Link to="/produtos">Produtos</Link>
            </li>
            <li>
              <Link to="/medicamentos">Medicamentos</Link>
            </li>
            <li>
              <Link to="/insumos">Insumos</Link>
            </li>
            <li>
              <Link to="/estoque">Estoque</Link>
            </li>
          </ul>
        </>
      ) : (
        <p>
          Faça <Link to="/login">login</Link> ou crie uma conta em <Link to="/cadastro">cadastro</Link> para depois
          aceder aos módulos protegidos por JWT.
        </p>
      )}
    </section>
  );
}
