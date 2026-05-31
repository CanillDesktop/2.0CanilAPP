import { Card, CardContent, Grid, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { useEstilosListagem } from '../../theme/useEstilosListagem';

export type CampoInfoDetalhe = {
  rotulo: string;
  valor: ReactNode;
};

type Props = {
  tituloSecao: string;
  campos: CampoInfoDetalhe[];
};

function Campo({ rotulo, valor }: CampoInfoDetalhe) {
  const { cores } = useEstilosListagem();

  return (
    <Grid size={{ xs: 12, sm: 6 }}>
      <Typography variant="caption" sx={{ color: cores.textMuted, fontWeight: 600, letterSpacing: 0.02 }}>
        {rotulo}
      </Typography>
      <Typography variant="body1" component="div" sx={{ color: cores.textPrimary, fontWeight: 600, mt: 0.35 }}>
        {valor}
      </Typography>
    </Grid>
  );
}

export function InfoCardDetalheItem({ tituloSecao, campos }: Props) {
  const { cores } = useEstilosListagem();

  return (
    <Card
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
        bgcolor: cores.bgCard,
        border: `1px solid ${cores.border}`,
        boxShadow: cores.sombraCard,
      }}
    >
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: cores.textPrimary, mb: 2 }}>
          {tituloSecao}
        </Typography>
        <Grid container spacing={2}>
          {campos.map((campo) => (
            <Campo key={campo.rotulo} {...campo} />
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
