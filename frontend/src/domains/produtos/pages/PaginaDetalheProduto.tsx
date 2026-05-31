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
import { OPCOES_CATEGORIA_PRODUTO_FILTRO } from '../constants/opcoesCategoriaProduto';
import { useMutacaoProduto } from '../hooks/useMutacaoProduto';
import { useProdutoDetalhe } from '../hooks/useProdutos';

const OPCOES_UNIDADE: Record<number, string> = {
  1: 'Unidade',
  2: 'Kg',
  3: 'Litro',
};

function rotuloCategoria(categoria: number) {
  return OPCOES_CATEGORIA_PRODUTO_FILTRO.find((o) => o.valor === categoria)?.rotulo ?? `Categoria ${categoria}`;
}

function rotuloUnidade(unidade: number) {
  return OPCOES_UNIDADE[unidade] ?? String(unidade);
}

export function PaginaDetalheProduto() {
  const params = useParams();
  const location = useLocation();
  const id = Number(params.id);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { cores } = useTemaApp();

  const { estado, carregar } = useProdutoDetalhe(Number.isFinite(id) ? id : undefined);
  const { excluir, carregando, erro, errosValidacao } = useMutacaoProduto();
  const [erroRetirada, setErroRetirada] = useState<string | null>(null);

  useEffect(() => {
    void carregar();
  }, [carregar, location.search]);

  const p = estado.dados;

  const lotes = useMemo(
    () => (p ? mapearItensEstoqueParaLotes(p.id, p.itensEstoque) : []),
    [p],
  );

  const totalEstoque = useMemo(() => lotes.reduce((acc, l) => acc + l.quantidade, 0), [lotes]);
  const lotesAtivos = useMemo(() => lotes.filter((l) => l.quantidade > 0).length, [lotes]);
  const proximoVencimentoTexto = useMemo(() => textoProximoVencimento(lotes), [lotes]);

  async function aoExcluir() {
    if (!Number.isFinite(id)) return;
    if (!window.confirm('Confirma excluir este produto?')) return;
    const ok = await excluir(id);
    if (ok) navigate('/produtos');
  }

  function handleRetirada(lote: LoteDetalhe) {
    if (!p) return;
    const state = montarRetiradaNavegacaoState({
      produto: p,
      produtoId: p.id,
      codItem: p.codigo,
      loteId: lote.id,
      loteCodigo: lote.codigo,
      quantidadeDisponivel: lote.quantidade,
      retornoRota: `/produtos/${p.id}`,
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
      {p ? (
        <CabecalhoDetalheItem
          rotuloLista="Voltar para produtos"
          rotaLista="/produtos"
          titulo={p.nomeInformado ?? p.nomeComercial ?? p.nomeOuDescricaoSimples ?? p.descricaoSimples ?? p.descricaoDetalhada ?? 'Produto'}
        />
      ) : (
        <CabecalhoDetalheItem rotuloLista="Voltar para produtos" rotaLista="/produtos" titulo="Produto" />
      )}

      <PainelErro mensagem={erroRetirada ?? estado.erro ?? erro} errosValidacao={errosValidacao} />
      <IndicadorCarregamento visivel={estado.carregando || carregando} />

      {p && (
        <>
          <KpiCardsDetalheItem
            totalEstoque={totalEstoque}
            lotesAtivos={lotesAtivos}
            proximoVencimentoTexto={proximoVencimentoTexto}
            carregando={estado.carregando}
          />

          <InfoCardDetalheItem
            tituloSecao="Informações do produto"
            campos={[
              { rotulo: 'Código', valor: p.codigo },
              { rotulo: 'Categoria', valor: rotuloCategoria(p.categoria) },
              { rotulo: 'Unidade', valor: rotuloUnidade(p.unidade) },
              { rotulo: 'Nível mínimo', valor: p.itemNivelEstoque.nivelMinimoEstoque },
            ]}
          />

          <ListaLotesDetalheItem
            idItem={p.id}
            codItem={p.codigo}
            lotes={lotes}
            isMobile={isMobile}
            rotuloEntidade="produto"
            mensagemVazio="Nenhum lote cadastrado para este produto."
            onRetirar={handleRetirada}
            onExcluir={aoExcluir}
          />
        </>
      )}
    </Box>
  );
}
