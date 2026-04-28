import { Link } from 'react-router-dom';
import type { MedicamentoLeituraDto } from '../types/tiposMedicamentos';

type Props = { itens: MedicamentoLeituraDto[] };

export function TabelaMedicamentos({ itens }: Props) {
  if (itens.length === 0) return <p>Nenhum medicamento encontrado.</p>;
  return (
    <table className="tabela-dados">
      <thead>
        <tr>
          <th>Código</th>
          <th>Nome comercial</th>
          <th>Prioridade</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {itens.map((m) => (
          <tr key={m.id}>
            <td>{m.codigo}</td>
            <td>{m.nomeOuDescricaoSimples}</td>
            <td>{m.prioridade}</td>
            <td>
              <Link to={`/medicamentos/${m.nomeOuDescricaoSimples}`}>Detalhes</Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
