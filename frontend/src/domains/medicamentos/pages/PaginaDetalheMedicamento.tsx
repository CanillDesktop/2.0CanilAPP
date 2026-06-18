import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { larguraConteudoPagina, paddingPaginaDetalhe } from '../../../shared/theme/estilosLayoutPagina';
import { CabecalhoDetalheItem } from '../../../shared/components/detalheItem/CabecalhoDetalheItem';
import { InfoCardDetalheItem } from '../../../shared/components/detalheItem/InfoCardDetalheItem';
import { KpiCardsDetalheItem } from '../../../shared/components/detalheItem/KpiCardsDetalheItem';
import { ListaLotesDetalheItem } from '../../../shared/components/detalheItem/ListaLotesDetalheItem';
import { IndicadorCarregamento } from '../../../shared/components/IndicadorCarregamento';
import { PainelErro } from '../../../shared/components/PainelErro';
import type { LoteDetalhe } from '../../../shared/types/loteDetalhe';
import { mapearItensEstoqueParaLotes, textoProximoVencimento } from '../../../shared/utils/mapearLotesDetalhe';
import { MENSAGEM_PRODUTO_SEM_NOME_RETIRADA, montarRetiradaNavegacaoState } from '../../estoque/utils/retiradaNavegacao';
import { useMedicamentoDetalhe, useMutacaoMedicamento } from '../hooks/useMedicamentos';

const OPCOES_PRIORIDADE: Record<number, string> = {
  0: 'Baixa',
  1: 'Média',
  2: 'Alta',
};

const OPCOES_PUBLICO_ALVO: Record<number, string> = {
  0: 'Animal',
  1: 'Humano e animal',
};

function rotuloPrioridade(prioridade: number) {
  return OPCOES_PRIORIDADE[prioridade] ?? String(prioridade);
}

function rotuloPublicoAlvo(publicoAlvo: number) {
  return OPCOES_PUBLICO_ALVO[publicoAlvo] ?? String(publicoAlvo);
}

export function PaginaDetalheMedicamento() {
  const params = useParams();
  const location = useLocation();
  const id = Number(params.id);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { cores } = useTemaApp();

  const { estado, carregar } = useMedicamentoDetalhe(Number.isFinite(id) ? id : undefined);
  const { excluir, carregando, erro, errosValidacao } = useMutacaoMedicamento();
  const [erroRetirada, setErroRetirada] = useState<string | null>(null);

  useEffect(() => {
    void carregar();
  }, [carregar, location.search]);

  const m = estado.dados;

  const lotes = useMemo(
    () => (m ? mapearItensEstoqueParaLotes(m.id, m.itensEstoque) : []),
    [m],
  );

  const totalEstoque = useMemo(() => lotes.reduce((acc, l) => acc + l.quantidade, 0), [lotes]);
  const lotesAtivos = useMemo(() => lotes.filter((l) => l.quantidade > 0).length, [lotes]);
  const proximoVencimentoTexto = useMemo(() => textoProximoVencimento(lotes), [lotes]);

  async function aoExcluir() {
    if (!Number.isFinite(id)) return;
    if (!window.confirm('Confirma excluir este medicamento?')) return;
    const resultado = await excluir(id);
    if (resultado.ok) navigate('/medicamentos');
  }

  function handleRetirada(lote: LoteDetalhe) {
    if (!m) return;
    const state = montarRetiradaNavegacaoState({
      produto: { ...m, descricaoDetalhada: m.descricaoDetalhada ?? m.descricao },
      produtoId: m.id,
      codItem: m.codigo,
      loteId: lote.id,
      loteCodigo: lote.codigo,
      quantidadeDisponivel: lote.quantidade,
      retornoRota: `/medicamentos/${m.id}`,
    });

    if (!state) {
      setErroRetirada(MENSAGEM_PRODUTO_SEM_NOME_RETIRADA);
      return;
    }

    setErroRetirada(null);
    navigate('/estoque/retirada', {
      state,
    });
  }

  return (
    <Box
      component="main"
      sx={{
        ...paddingPaginaDetalhe,
        ...larguraConteudoPagina,
        bgcolor: cores.bgConteudo,
        minHeight: '100%',
      }}
    >
      {m ? (
        <CabecalhoDetalheItem
          rotuloLista="Voltar para medicamentos"
          rotaLista="/medicamentos"
          titulo={m.nomeComercial ?? m.nomeOuDescricaoSimples ?? m.descricaoSimples ?? m.descricaoDetalhada ?? m.descricao ?? 'Medicamento'}
        />
      ) : (
        <CabecalhoDetalheItem rotuloLista="Voltar para medicamentos" rotaLista="/medicamentos" titulo="Medicamento" />
      )}

      <PainelErro mensagem={erroRetirada ?? estado.erro ?? erro} errosValidacao={errosValidacao} />
      <IndicadorCarregamento visivel={estado.carregando || carregando} />

      {m && (
        <>
          <KpiCardsDetalheItem
            totalEstoque={totalEstoque}
            lotesAtivos={lotesAtivos}
            proximoVencimentoTexto={proximoVencimentoTexto}
            carregando={estado.carregando}
          />

          <InfoCardDetalheItem
            tituloSecao="Informações do medicamento"
            campos={[
              { rotulo: 'Código', valor: m.codigo },
              { rotulo: 'Nome comercial', valor: m.nomeComercial ?? m.nomeOuDescricaoSimples },
              { rotulo: 'Fórmula', valor: m.formula },
              { rotulo: 'Descrição', valor: m.descricao },
              { rotulo: 'Prioridade', valor: rotuloPrioridade(m.prioridade) },
              { rotulo: 'Público-alvo', valor: rotuloPublicoAlvo(m.publicoAlvo) },
              { rotulo: 'Nível mínimo', valor: m.itemNivelEstoque.nivelMinimoEstoque },
            ]}
          />

          <ListaLotesDetalheItem
            idItem={m.id}
            codItem={m.codigo}
            lotes={lotes}
            isMobile={isMobile}
            rotuloEntidade="medicamento"
            mensagemVazio="Nenhum lote cadastrado para este medicamento."
            onRetirar={handleRetirada}
            onExcluir={aoExcluir}
          />
        </>
      )}
    </Box>
  );
}
