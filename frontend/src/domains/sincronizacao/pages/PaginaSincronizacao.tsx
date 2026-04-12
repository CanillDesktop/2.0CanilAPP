import { IndicadorCarregamento } from '../../../shared/components/IndicadorCarregamento';
import { PainelErro } from '../../../shared/components/PainelErro';
import { SecaoInformativa } from '../components/SecaoInformativa';
import { useSincronizacao } from '../hooks/useSincronizacao';

/**
 * Listagem + detalhe/ações: o backend mantém estes endpoints por compatibilidade com o app legado.
 */
export function PaginaSincronizacao() {
  const { sincronizar, limpar, carregando, erro, mensagem } = useSincronizacao();

  return (
    <section>
      <h1>Sincronização</h1>
      <SecaoInformativa />
      <p>
        O backend indica que não há sincronização externa necessária (dados no SQLite do servidor). Estas ações
        existem para compatibilidade com clientes antigos.
      </p>
      <PainelErro mensagem={erro} />
      {mensagem && <p className="painel-sucesso">{mensagem}</p>}
      <div className="linha-botoes">
        <button type="button" onClick={() => void sincronizar()} disabled={carregando}>
          Executar sincronização
        </button>
        <button type="button" onClick={() => void limpar()} disabled={carregando}>
          Limpar fila (noop)
        </button>
      </div>
      <IndicadorCarregamento visivel={carregando} />
    </section>
  );
}
