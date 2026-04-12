import { Link } from 'react-router-dom';
import type { ProdutoLeituraDto } from '../types/tiposProdutos';

type Props = {
  itens: ProdutoLeituraDto[];
};

export function TabelaProdutos({ itens }: Props) {
  if (itens.length === 0) return <p>Nenhum produto encontrado.</p>;

  return (
    <table className="tabela-dados">
      <thead>
        <tr>
          <th>Código</th>
          <th>Descrição</th>
          <th>Categoria</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {itens.map((p) => (
          <tr key={p.idItem}>
            <td>{p.codItem}</td>
            <td>{p.nomeItem}</td>
            <td>{p.categoria}</td>
            <td>
              <Link to={`/produtos/${p.idItem}`}>Detalhes</Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
