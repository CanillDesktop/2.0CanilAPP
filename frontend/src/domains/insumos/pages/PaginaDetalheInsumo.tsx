import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { CabecalhoDetalheItem } from '../../../shared/components/detalheItem/CabecalhoDetalheItem';
import { InfoCardDetalheItem } from '../../../shared/components/detalheItem/InfoCardDetalheItem';
import { KpiCardsDetalheItem } from '../../../shared/components/detalheItem/KpiCardsDetalheItem';
import { ListaLotesDetalheItem } from '../../../shared/components/detalheItem/ListaLotesDetalheItem';
import { IndicadorCarregamento } from '../../../shared/components/IndicadorCarregamento';
import { PainelErro } from '../../../shared/components/PainelErro';
import type { LoteDetalhe } from '../../../shared/types/loteDetalhe';
import { mapearItensEstoqueParaLotes, textoProximoVencimento } from '../../../shared/utils/mapearLotesDetalhe';
import { MENSAGEM_PRODUTO_SEM_NOME_RETIRADA, montarRetiradaNavegacaoState } from '../../estoque/utils/retiradaNavegacao';
import { useInsumoDetalhe, useMutacaoInsumo } from '../hooks/useInsumos';

const OPCOES_UNIDADE: Record<number, string> = {
  1: 'Unidade',
  2: 'Kg',
  3: 'Litro',
};

function rotuloUnidade(unidade: number) {
  return OPCOES_UNIDADE[unidade] ?? String(unidade);
}

export function PaginaDetalheInsumo() {
  const params = useParams();
  const location = useLocation();
  const id = Number(params.id);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { cores } = useTemaApp();

  const { estado, carregar } = useInsumoDetalhe(Number.isFinite(id) ? id : undefined);
  const { excluir, carregando, erro, errosValidacao } = useMutacaoInsumo();
  const [erroRetirada, setErroRetirada] = useState<string | null>(null);

  useEffect(() => {
    void carregar();
  }, [carregar, location.search]);

  const i = estado.dados;

  const lotes = useMemo(
    () => (i ? mapearItensEstoqueParaLotes(i.id, i.itensEstoque) : []),
    [i],
  );

  const totalEstoque = useMemo(() => lotes.reduce((acc, l) => acc + l.quantidade, 0), [lotes]);
  const lotesAtivos = useMemo(() => lotes.filter((l) => l.quantidade > 0).length, [lotes]);
  const proximoVencimentoTexto = useMemo(() => textoProximoVencimento(lotes), [lotes]);

  async function aoExcluir() {
    if (!Number.isFinite(id)) return;
    if (!window.confirm('Confirma excluir este insumo?')) return;
    const ok = await excluir(id);
    if (ok) navigate('/insumos');
  }

  function handleRetirada(lote: LoteDetalhe) {
    if (!i) return;
    const state = montarRetiradaNavegacaoState({
      produto: { ...i, descricaoSimples: i.descricaoSimples ?? i.descricaoSimplificada },
      produtoId: i.id,
      codItem: i.codigo,
      loteId: lote.id,
      loteCodigo: lote.codigo,
      quantidadeDisponivel: lote.quantidade,
      retornoRota: `/insumos/${i.id}`,
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
        p: { xs: 2, sm: 3 },
        bgcolor: cores.bgConteudo,
        minHeight: '100%',
      }}
    >
      {i ? (
        <CabecalhoDetalheItem
          rotuloLista="Voltar para insumos"
          rotaLista="/insumos"
          titulo={i.nomeOuDescricaoSimples ?? i.descricaoSimples ?? i.descricaoSimplificada ?? i.descricaoDetalhada ?? 'Insumo'}
        />
      ) : (
        <CabecalhoDetalheItem rotuloLista="Voltar para insumos" rotaLista="/insumos" titulo="Insumo" />
      )}

      <PainelErro mensagem={erroRetirada ?? estado.erro ?? erro} errosValidacao={errosValidacao} />
      <IndicadorCarregamento visivel={estado.carregando || carregando} />

      {i && (
        <>
          <KpiCardsDetalheItem
            totalEstoque={totalEstoque}
            lotesAtivos={lotesAtivos}
            proximoVencimentoTexto={proximoVencimentoTexto}
            carregando={estado.carregando}
          />

          <InfoCardDetalheItem
            tituloSecao="Informações do insumo"
            campos={[
              { rotulo: 'Código', valor: i.codigo },
              { rotulo: 'Descrição simplificada', valor: i.nomeOuDescricaoSimples ?? i.descricaoSimples ?? i.descricaoSimplificada },
              { rotulo: 'Descrição detalhada', valor: i.descricaoDetalhada },
              { rotulo: 'Unidade', valor: rotuloUnidade(i.unidade) },
              { rotulo: 'Nível mínimo', valor: i.itemNivelEstoque.nivelMinimoEstoque },
            ]}
          />

          <ListaLotesDetalheItem
            idItem={i.id}
            codItem={i.codigo}
            lotes={lotes}
            isMobile={isMobile}
            rotuloEntidade="insumo"
            mensagemVazio="Nenhum lote cadastrado para este insumo."
            onRetirar={handleRetirada}
            onExcluir={aoExcluir}
          />
        </>
      )}
    </Box>
  );
}
