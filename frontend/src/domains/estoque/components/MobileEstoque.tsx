import { Alert, Grid, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { KpiCard } from './KpiCard';
import { QuickActions, type AcaoRapida } from './QuickActions';
import { AlertaCard } from './AlertaCard';
import type { LinhaOperacionalEstoque } from '../types/tiposEstoque';

export type MobileEstoqueProps = {
  carregando: boolean;
  erroCarregamento: string | null;
  totalItens: number;
  totalBaixoEstoque: number;
  produtosAVencer: number;
  itensAbaixoMinimo: LinhaOperacionalEstoque[];
  itensProximoVencimento: LinhaOperacionalEstoque[];
  acoesRapidas: AcaoRapida[];
  iconeTotal: ReactNode;
  iconeBaixo: ReactNode;
  iconeVencer: ReactNode;
  onItemClick: (item: LinhaOperacionalEstoque) => void;
};

export function MobileEstoque({
  carregando,
  erroCarregamento,
  totalItens,
  totalBaixoEstoque,
  produtosAVencer,
  itensAbaixoMinimo,
  itensProximoVencimento,
  acoesRapidas,
  iconeTotal,
  iconeBaixo,
  iconeVencer,
  onItemClick,
}: MobileEstoqueProps) {
  return (
    <Stack spacing={2.5}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#e2e8f0' }}>
        Resumo operacional
      </Typography>
      <Grid container spacing={1.5}>
        <Grid size={12}>
          <KpiCard
            titulo="Total"
            valor={String(totalItens)}
            icone={iconeTotal}
            cor="primary"
            carregando={carregando}
            destaque
          />
        </Grid>
        <Grid size={12}>
          <KpiCard
            titulo="Baixo estoque"
            valor={String(totalBaixoEstoque)}
            icone={iconeBaixo}
            cor="warning"
            carregando={carregando}
            destaque
          />
        </Grid>
        <Grid size={12}>
          <KpiCard
            titulo="A vencer"
            valor={String(produtosAVencer)}
            icone={iconeVencer}
            cor="success"
            carregando={carregando}
            destaque
          />
        </Grid>
      </Grid>

      <Stack spacing={1}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#e2e8f0' }}>
          Ações rápidas
        </Typography>
        <QuickActions acoes={acoesRapidas} />
      </Stack>

      {erroCarregamento ? (
        <Alert severity="error">{erroCarregamento}</Alert>
      ) : (
        <Stack spacing={2}>
          <AlertaCard
            variante="abaixo_minimo"
            titulo="Abaixo do nível mínimo"
            descricao="Toque em um item para abrir o cadastro e repor o estoque."
            itens={itensAbaixoMinimo}
            carregando={carregando}
            vazioLabel="Nenhum item abaixo do nível mínimo."
            onItemClick={onItemClick}
          />
          <AlertaCard
            variante="proximo_vencimento"
            titulo="Próximo do vencimento"
            descricao="Validade em até 30 dias. Toque para revisar lotes."
            itens={itensProximoVencimento}
            carregando={carregando}
            vazioLabel="Nenhum item próximo do vencimento."
            onItemClick={onItemClick}
          />
        </Stack>
      )}
    </Stack>
  );
}
