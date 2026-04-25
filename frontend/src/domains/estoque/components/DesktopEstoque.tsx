import {
  Alert,
  Box,
  Button,
  Grid,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import type { FormEvent, ReactNode, SyntheticEvent } from 'react';
import { DataTableEstoque } from './DataTableEstoque';
import { KpiCard } from './KpiCard';
import { QuickActions, type AcaoRapida } from './QuickActions';
import { AlertaCard } from './AlertaCard';
import type { LinhaOperacionalEstoque } from '../types/tiposEstoque';

export type DesktopEstoqueProps = {
  carregando: boolean;
  erroCarregamento: string | null;
  linhasFiltradas: LinhaOperacionalEstoque[];
  filtroNome: string;
  onFiltroNomeChange: (valor: string) => void;
  onConsultar: (e: FormEvent) => void;
  abaTipo: number;
  onAbaChange: (e: SyntheticEvent, novoValor: number) => void;
  contagemPorOrigem: { produtos: number; medicamentos: number; insumos: number };
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

export function DesktopEstoque({
  carregando,
  erroCarregamento,
  linhasFiltradas,
  filtroNome,
  onFiltroNomeChange,
  onConsultar,
  abaTipo,
  onAbaChange,
  contagemPorOrigem,
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
}: DesktopEstoqueProps) {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <KpiCard
          titulo="Total"
          valor={String(totalItens)}
          icone={iconeTotal}
          cor="primary"
          carregando={carregando}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <KpiCard
          titulo="Baixo estoque"
          valor={String(totalBaixoEstoque)}
          icone={iconeBaixo}
          cor="warning"
          carregando={carregando}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <KpiCard
          titulo="Próximo vencimento"
          valor={String(produtosAVencer)}
          icone={iconeVencer}
          cor="success"
          carregando={carregando}
        />
      </Grid>

      <Grid size={12}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#e2e8f0' }}>
          Ações rápidas
        </Typography>
        <QuickActions acoes={acoesRapidas} />
      </Grid>

      <Grid size={12}>
        {erroCarregamento ? (
          <Alert severity="error">{erroCarregamento}</Alert>
        ) : (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <AlertaCard
                variante="abaixo_minimo"
                titulo="Abaixo do nível mínimo"
                descricao="Itens com quantidade abaixo do mínimo cadastrado. Clique para abrir o cadastro."
                itens={itensAbaixoMinimo}
                carregando={carregando}
                vazioLabel="Nenhum item abaixo do nível mínimo no momento."
                onItemClick={onItemClick}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <AlertaCard
                variante="proximo_vencimento"
                titulo="Próximo do vencimento"
                descricao="Itens com validade em até 30 dias. Clique para abrir o cadastro."
                itens={itensProximoVencimento}
                carregando={carregando}
                vazioLabel="Nenhum item próximo do vencimento no momento."
                onItemClick={onItemClick}
              />
            </Grid>
          </Grid>
        )}
      </Grid>

      <Grid size={12}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 1.4, gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#e2e8f0' }}>
            Estoque
          </Typography>
          <Box
            component="form"
            onSubmit={onConsultar}
            sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}
          >
            <TextField
              value={filtroNome}
              onChange={(e) => onFiltroNomeChange(e.target.value)}
              placeholder="Consultar item por nome"
              size="small"
              sx={{
                minWidth: 240,
                '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#0f172a' },
                '& .MuiInputBase-input': { color: '#e2e8f0' },
              }}
            />
            <Button type="submit" variant="contained">
              Consultar
            </Button>
          </Box>
        </Stack>
        <Tabs
          value={abaTipo}
          onChange={onAbaChange}
          textColor="inherit"
          indicatorColor="primary"
          variant="standard"
          sx={{
            mb: 2,
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            '& .MuiTab-root': { color: 'rgba(226,232,240,0.72)' },
            '& .Mui-selected': { color: '#e2e8f0' },
          }}
        >
          <Tab
            label={`Produtos (${contagemPorOrigem.produtos})`}
            sx={{ textTransform: 'none', fontWeight: 500 }}
          />
          <Tab
            label={`Medicamentos (${contagemPorOrigem.medicamentos})`}
            sx={{ textTransform: 'none', fontWeight: 500 }}
          />
          <Tab label={`Insumos (${contagemPorOrigem.insumos})`} sx={{ textTransform: 'none', fontWeight: 500 }} />
        </Tabs>
        <DataTableEstoque linhas={linhasFiltradas} carregando={carregando} aoClicarItem={onItemClick} />
      </Grid>
    </Grid>
  );
}
