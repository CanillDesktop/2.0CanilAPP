import { Card, CardContent, Grid, Typography } from '@mui/material';

type CampoProps = { rotulo: string; valor: string | number };

function Campo({ rotulo, valor }: CampoProps) {
  return (
    <Grid size={{ xs: 12, sm: 6 }}>
      <Typography variant="caption" sx={{ color: 'rgba(148, 163, 184, 0.95)', fontWeight: 600, letterSpacing: 0.02 }}>
        {rotulo}
      </Typography>
      <Typography variant="body1" sx={{ color: '#e2e8f0', fontWeight: 600, mt: 0.35 }}>
        {valor}
      </Typography>
    </Grid>
  );
}

export type ProductInfoCardProps = {
  codigo: string;
  categoria: string | number;
  unidade: string | number;
  nivelMinimo: number;
};

export function ProductInfoCard({ codigo, categoria, unidade, nivelMinimo }: ProductInfoCardProps) {
  return (
    <Card
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
        bgcolor: '#0f172a',
        border: '1px solid rgba(148, 163, 184, 0.12)',
        boxShadow: 'none',
      }}
    >
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f1f5f9', mb: 2 }}>
          Informações do produto
        </Typography>
        <Grid container spacing={2}>
          <Campo rotulo="Código" valor={codigo} />
          <Campo rotulo="Categoria" valor={categoria} />
          <Campo rotulo="Unidade" valor={unidade} />
          <Campo rotulo="Nível mínimo" valor={nivelMinimo} />
        </Grid>
      </CardContent>
    </Card>
  );
}
