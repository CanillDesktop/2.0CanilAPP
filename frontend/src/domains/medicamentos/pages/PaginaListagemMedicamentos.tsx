import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IndicadorCarregamento } from '../../../shared/components/IndicadorCarregamento';
import { PainelErro } from '../../../shared/components/PainelErro';
import { TabelaMedicamentos } from '../components/TabelaMedicamentos';
import { useListaMedicamentos } from '../hooks/useMedicamentos';

export function PaginaListagemMedicamentos() {
  const { estado, carregar } = useListaMedicamentos();
  useEffect(() => {
    void carregar();
  }, [carregar]);

  return (
    <section>
      <header className="cabecalho-secao">
        <h1>Medicamentos</h1>
        <Link className="botao-secundario" to="/medicamentos/novo">
          Novo medicamento
        </Link>
      </header>
      <PainelErro mensagem={estado.erro} />
      <IndicadorCarregamento visivel={estado.carregando} />
      {estado.dados && <TabelaMedicamentos itens={estado.dados} />}
    </section>
  );
}
