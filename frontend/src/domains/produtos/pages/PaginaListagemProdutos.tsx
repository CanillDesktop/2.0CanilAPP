import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IndicadorCarregamento } from '../../../shared/components/IndicadorCarregamento';
import { PainelErro } from '../../../shared/components/PainelErro';
import { TabelaProdutos } from '../components/TabelaProdutos';
import { useListaProdutos } from '../hooks/useProdutos';

export function PaginaListagemProdutos() {
  const { estado, carregar } = useListaProdutos();

  useEffect(() => {
    void carregar();
  }, [carregar]);

  return (
    <section>
      <header className="cabecalho-secao">
        <h1>Produtos</h1>
        <Link className="botao-secundario" to="/produtos/novo">
          Novo produto
        </Link>
      </header>
      <PainelErro mensagem={estado.erro} />
      <IndicadorCarregamento visivel={estado.carregando} />
      {estado.dados && <TabelaProdutos itens={estado.dados} />}
    </section>
  );
}
