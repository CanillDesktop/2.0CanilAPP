import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IndicadorCarregamento } from '../../../shared/components/IndicadorCarregamento';
import { PainelErro } from '../../../shared/components/PainelErro';
import { TabelaInsumos } from '../components/TabelaInsumos';
import { useListaInsumos } from '../hooks/useInsumos';

export function PaginaListagemInsumos() {
  const { estado, carregar } = useListaInsumos();
  useEffect(() => {
    void carregar();
  }, [carregar]);

  return (
    <section>
      <header className="cabecalho-secao">
        <h1>Insumos</h1>
        <Link className="botao-secundario" to="/insumos/novo">
          Novo insumo
        </Link>
      </header>
      <PainelErro mensagem={estado.erro} />
      <IndicadorCarregamento visivel={estado.carregando} />
      {estado.dados && <TabelaInsumos itens={estado.dados} />}
    </section>
  );
}
