import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { IndicadorCarregamento } from '../../../shared/components/IndicadorCarregamento';
import { PainelErro } from '../../../shared/components/PainelErro';
import { useItemEstoqueDetalhe } from '../hooks/useEstoque';

export function PaginaDetalheItemEstoque() {
  const params = useParams();
  const id = Number(params.id);
  const { estado, carregar } = useItemEstoqueDetalhe(Number.isFinite(id) ? id : undefined);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const item = estado.dados;

  return (
    <section>
      <header className="cabecalho-secao">
        <h1>Item de estoque</h1>
        <Link className="botao-secundario" to="/estoque">
          Voltar
        </Link>
      </header>
      <PainelErro mensagem={estado.erro} />
      <IndicadorCarregamento visivel={estado.carregando} />
      {item && (
        <dl className="lista-detalhe">
          <dt>ID item</dt>
          <dd>{item.idItem}</dd>
          <dt>Código</dt>
          <dd>{item.codItem}</dd>
          <dt>Lote</dt>
          <dd>{item.lote}</dd>
          <dt>Quantidade</dt>
          <dd>{item.quantidade}</dd>
          <dt>Data de entrega</dt>
          <dd>{item.dataEntrega}</dd>
          <dt>Validade</dt>
          <dd>{item.dataValidade ?? '—'}</dd>
        </dl>
      )}
    </section>
  );
}
