import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * Não existe endpoint de listagem geral de estoque; esta página funciona como hub de navegação.
 */
export function PaginaListagemEstoque() {
  const [idConsulta, setIdConsulta] = useState('');
  const navegar = useNavigate();

  function aoConsultar(e: FormEvent) {
    e.preventDefault();
    const id = Number(idConsulta);
    if (!Number.isFinite(id) || id <= 0) return;
    navegar(`/estoque/item/${id}`);
  }

  return (
    <section>
      <h1>Estoque</h1>
      <p>Use as opções abaixo para consultar um item de estoque por identificador ou registrar movimentações.</p>
      <ul className="lista-links">
        <li>
          <Link to="/estoque/lotes/novo">Cadastrar novo lote (entrada)</Link>
        </li>
        <li>
          <Link to="/estoque/retirada">Registrar retirada</Link>
        </li>
      </ul>
      <form className="cartao" onSubmit={aoConsultar}>
        <h2>Consulta por ID</h2>
        <label>
          ID do item de estoque
          <input value={idConsulta} onChange={(e) => setIdConsulta(e.target.value)} inputMode="numeric" />
        </label>
        <button type="submit">Consultar</button>
      </form>
    </section>
  );
}
