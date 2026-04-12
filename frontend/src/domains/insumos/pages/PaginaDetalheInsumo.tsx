import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { IndicadorCarregamento } from '../../../shared/components/IndicadorCarregamento';
import { PainelErro } from '../../../shared/components/PainelErro';
import { useInsumoDetalhe, useMutacaoInsumo } from '../hooks/useInsumos';

export function PaginaDetalheInsumo() {
  const params = useParams();
  const id = Number(params.id);
  const navegar = useNavigate();
  const { estado, carregar } = useInsumoDetalhe(Number.isFinite(id) ? id : undefined);
  const { excluir, carregando, erro } = useMutacaoInsumo();

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function aoExcluir() {
    if (!Number.isFinite(id)) return;
    if (!window.confirm('Confirma excluir este insumo?')) return;
    const ok = await excluir(id);
    if (ok) navegar('/insumos');
  }

  const i = estado.dados;

  return (
    <section>
      <header className="cabecalho-secao">
        <h1>Insumo</h1>
        <Link className="botao-secundario" to="/insumos">
          Voltar
        </Link>
      </header>
      <PainelErro mensagem={estado.erro ?? erro} />
      <IndicadorCarregamento visivel={estado.carregando || carregando} />
      {i && (
        <>
          <dl className="lista-detalhe">
            <dt>Código</dt>
            <dd>{i.codItem}</dd>
            <dt>Descrição</dt>
            <dd>{i.nomeItem}</dd>
            <dt>Detalhada</dt>
            <dd>{i.descricaoDetalhada}</dd>
            <dt>Unidade</dt>
            <dd>{i.unidade}</dd>
          </dl>
          <h2>Lotes</h2>
          <ul>
            {i.itensEstoque.map((l) => (
              <li key={`${l.lote}-${l.codItem}`}>
                Lote {l.lote}: {l.quantidade} un.
              </li>
            ))}
          </ul>
          <div className="linha-botoes">
            <button type="button" onClick={aoExcluir}>
              Excluir
            </button>
            <Link
              className="botao-secundario"
              to={`/estoque/lotes/novo?idItem=${i.idItem}&codItem=${encodeURIComponent(i.codItem)}`}
            >
              Adicionar lote
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
