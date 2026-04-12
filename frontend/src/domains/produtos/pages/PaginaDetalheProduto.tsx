import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { IndicadorCarregamento } from '../../../shared/components/IndicadorCarregamento';
import { PainelErro } from '../../../shared/components/PainelErro';
import { useMutacaoProduto } from '../hooks/useMutacaoProduto';
import { useProdutoDetalhe } from '../hooks/useProdutos';

export function PaginaDetalheProduto() {
  const params = useParams();
  const id = Number(params.id);
  const navegar = useNavigate();
  const { estado, carregar } = useProdutoDetalhe(Number.isFinite(id) ? id : undefined);
  const { excluir, carregando, erro } = useMutacaoProduto();

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function aoExcluir() {
    if (!Number.isFinite(id)) return;
    if (!window.confirm('Confirma excluir este produto?')) return;
    const ok = await excluir(id);
    if (ok) navegar('/produtos');
  }

  const p = estado.dados;

  return (
    <section>
      <header className="cabecalho-secao">
        <h1>Produto</h1>
        <Link className="botao-secundario" to="/produtos">
          Voltar
        </Link>
      </header>
      <PainelErro mensagem={estado.erro ?? erro} />
      <IndicadorCarregamento visivel={estado.carregando || carregando} />
      {p && (
        <>
          <dl className="lista-detalhe">
            <dt>Código</dt>
            <dd>{p.codItem}</dd>
            <dt>Descrição</dt>
            <dd>{p.nomeItem}</dd>
            <dt>Unidade / Categoria</dt>
            <dd>
              {p.unidade} / {p.categoria}
            </dd>
            <dt>Nível mínimo</dt>
            <dd>{p.itemNivelEstoque.nivelMinimoEstoque}</dd>
          </dl>
          <h2>Lotes</h2>
          <ul>
            {p.itensEstoque.map((l) => (
              <li key={`${l.lote}-${l.codItem}`}>
                Lote {l.lote}: {l.quantidade} un. (validade {l.dataValidade ?? '—'})
              </li>
            ))}
          </ul>
          <div className="linha-botoes">
            <button type="button" onClick={aoExcluir}>
              Excluir
            </button>
            <Link className="botao-secundario" to={`/estoque/lotes/novo?idItem=${p.idItem}&codItem=${encodeURIComponent(p.codItem)}`}>
              Adicionar lote
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
