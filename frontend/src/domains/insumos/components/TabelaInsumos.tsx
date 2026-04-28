import { Link } from 'react-router-dom';
import type { InsumoLeituraDto } from '../types/tiposInsumos';

type Props = { itens: InsumoLeituraDto[] };

export function TabelaInsumos({ itens }: Props) {
  if (itens.length === 0) return <p>Nenhum insumo encontrado.</p>;
  return (
    <table className="tabela-dados">
      <thead>
        <tr>
          <th>Código</th>
          <th>Descrição</th>
          <th>Unidade</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {itens.map((i) => (
          <tr key={i.id}>
            <td>{i.codigo}</td>
            <td>{i.nomeOuDescricaoSimples}</td>
            <td>{i.unidade}</td>
            <td>
              <Link to={`/insumos/${i.id}`}>Detalhes</Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
