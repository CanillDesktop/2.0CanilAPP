import { useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { IndicadorCarregamento } from '../../../shared/components/IndicadorCarregamento';
import { PainelErro } from '../../../shared/components/PainelErro';
import { LoteSection } from '../components/LoteSection';
import { useMutacaoProduto } from '../hooks/useMutacaoProduto';
import { useProdutoDetalhe } from '../hooks/useProdutos';

export function PaginaDetalheProduto() {
  const params = useParams();
  const location = useLocation();
  const id = Number(params.id);
  const navegar = useNavigate();
  const { estado, carregar } = useProdutoDetalhe(Number.isFinite(id) ? id : undefined);
  const { excluir, carregando, erro } = useMutacaoProduto();

  useEffect(() => {
    void carregar();
  }, [carregar, location.search]);

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
          <LoteSection
            idItem={p.idItem}
            codItem={p.codItem}
            produtoNome={p.nomeItem}
            lotesOriginais={p.itensEstoque}
            onExcluirProduto={aoExcluir}
          />
        </>
      )}
    </section>
  );
}
