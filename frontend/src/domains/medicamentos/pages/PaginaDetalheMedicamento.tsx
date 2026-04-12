import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { IndicadorCarregamento } from '../../../shared/components/IndicadorCarregamento';
import { PainelErro } from '../../../shared/components/PainelErro';
import { useMedicamentoDetalhe, useMutacaoMedicamento } from '../hooks/useMedicamentos';

export function PaginaDetalheMedicamento() {
  const params = useParams();
  const id = Number(params.id);
  const navegar = useNavigate();
  const { estado, carregar } = useMedicamentoDetalhe(Number.isFinite(id) ? id : undefined);
  const { excluir, carregando, erro } = useMutacaoMedicamento();

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function aoExcluir() {
    if (!Number.isFinite(id)) return;
    if (!window.confirm('Confirma excluir este medicamento?')) return;
    const ok = await excluir(id);
    if (ok) navegar('/medicamentos');
  }

  const m = estado.dados;

  return (
    <section>
      <header className="cabecalho-secao">
        <h1>Medicamento</h1>
        <Link className="botao-secundario" to="/medicamentos">
          Voltar
        </Link>
      </header>
      <PainelErro mensagem={estado.erro ?? erro} />
      <IndicadorCarregamento visivel={estado.carregando || carregando} />
      {m && (
        <>
          <dl className="lista-detalhe">
            <dt>Código</dt>
            <dd>{m.codItem}</dd>
            <dt>Nome comercial</dt>
            <dd>{m.nomeItem}</dd>
            <dt>Fórmula</dt>
            <dd>{m.formula}</dd>
            <dt>Descrição</dt>
            <dd>{m.descricaoMedicamento}</dd>
            <dt>Prioridade / Público-alvo</dt>
            <dd>
              {m.prioridade} / {m.publicoAlvo}
            </dd>
          </dl>
          <h2>Lotes</h2>
          <ul>
            {m.itensEstoque.map((l) => (
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
              to={`/estoque/lotes/novo?idItem=${m.idItem}&codItem=${encodeURIComponent(m.codItem)}`}
            >
              Adicionar lote
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
