import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Box, Button, Card, Stack, Step, StepLabel, Stepper, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTemaApp } from '../../app/providers/ContextoTemaApp';
import { useEstilosListagem } from '../theme/useEstilosListagem';

const MotionBox = motion(Box);

type LayoutProps = {
  titulo: string;
  subtitulo?: string;
  rotaLista: string;
  rotuloLista: string;
  icone: ReactNode;
  passos: string[];
  passoAtual: number;
  children: ReactNode;
};

export function LayoutFormularioCadastro({
  titulo,
  subtitulo,
  rotaLista,
  rotuloLista,
  icone,
  passos,
  passoAtual,
  children,
}: LayoutProps) {
  const navigate = useNavigate();
  const estilos = useEstilosListagem();
  const { cores } = estilos;

  return (
    <section style={{ minHeight: '100%', backgroundColor: cores.bgConteudo }}>
      <MotionBox initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
        <Stack sx={{ ...estilos.painel, pt: { xs: 2, md: 3 } }}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, mb: 1.5, flexWrap: 'wrap' }}>
            <Button
              size="small"
              startIcon={<ArrowBackIcon fontSize="small" />}
              onClick={() => navigate(rotaLista)}
              sx={{ textTransform: 'none', color: cores.textMuted, minWidth: 0, px: 0.5 }}
            >
              {rotuloLista}
            </Button>
            <ChevronRightIcon sx={{ fontSize: 18, color: cores.textMuted }} />
            <Typography variant="body2" sx={{ color: cores.textPrimary, fontWeight: 600 }}>
              {titulo}
            </Typography>
          </Stack>

          <Card
            sx={{
              p: { xs: 2, sm: 2.5 },
              mb: 3,
              borderRadius: 3,
              bgcolor: cores.metricCardBg,
              border: `1px solid ${cores.metricCardBorder}`,
              boxShadow: cores.sombraCard,
            }}
          >
            <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
              <Box
                sx={{
                  p: 1.25,
                  borderRadius: 2,
                  bgcolor: cores.chipBg,
                  border: `1px solid ${cores.chipBorder}`,
                  color: cores.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {icone}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: cores.textPrimary, lineHeight: 1.25 }}>
                  {titulo}
                </Typography>
                {subtitulo ? (
                  <Typography variant="body2" sx={{ color: cores.textSecondary, mt: 0.5 }}>
                    {subtitulo}
                  </Typography>
                ) : null}
              </Box>
            </Stack>
          </Card>

          <Stepper activeStep={passoAtual} alternativeLabel sx={{ mb: 3 }}>
            {passos.map((rotulo) => (
              <Step key={rotulo}>
                <StepLabel
                  sx={{
                    '& .MuiStepLabel-label': { color: cores.textMuted, fontWeight: 600 },
                    '& .MuiStepLabel-label.Mui-active': { color: cores.accent, fontWeight: 700 },
                    '& .MuiStepLabel-label.Mui-completed': { color: cores.textSecondary },
                    '& .MuiStepIcon-root': { color: cores.borderForte },
                    '& .MuiStepIcon-root.Mui-active': { color: cores.accent },
                    '& .MuiStepIcon-root.Mui-completed': { color: cores.accent },
                  }}
                >
                  {rotulo}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {children}
        </Stack>
      </MotionBox>
    </section>
  );
}

export type VarianteSecaoCadastro = 'identidade' | 'estoque' | 'config';

type SecaoProps = {
  titulo: string;
  descricao?: string;
  icone?: ReactNode;
  variante?: VarianteSecaoCadastro;
  children: ReactNode;
  acaoCabecalho?: ReactNode;
};

function estilosVarianteSecao(variante: VarianteSecaoCadastro, cores: ReturnType<typeof useTemaApp>['cores']) {
  if (variante === 'estoque') {
    return {
      bgcolor: cores.alertVencimentoBg,
      border: cores.alertVencimentoBorder,
      iconeBg: cores.chipBg,
    };
  }
  if (variante === 'config') {
    return {
      bgcolor: cores.bgCard,
      border: cores.border,
      iconeBg: cores.hoverSurface,
    };
  }
  return {
    bgcolor: cores.metricCardBg,
    border: cores.metricCardBorder,
    iconeBg: cores.chipBg,
  };
}

export function SecaoFormularioCadastro({
  titulo,
  descricao,
  icone,
  variante = 'identidade',
  children,
  acaoCabecalho,
}: SecaoProps) {
  const estilos = useEstilosListagem();
  const { cores } = estilos;
  const visual = estilosVarianteSecao(variante, cores);

  return (
    <Card
      sx={{
        p: { xs: 2, sm: 3 },
        mb: 3,
        borderRadius: 3,
        bgcolor: visual.bgcolor,
        border: `1px solid ${visual.border}`,
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 1,
          mb: descricao ? 1 : 2,
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          {icone ? (
            <Box
              sx={{
                p: 1,
                borderRadius: 1.5,
                bgcolor: visual.iconeBg,
                color: cores.accent,
                display: 'flex',
              }}
            >
              {icone}
            </Box>
          ) : null}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: cores.textPrimary }}>
              {titulo}
            </Typography>
            {descricao ? (
              <Typography variant="caption" sx={{ color: cores.textMuted, display: 'block', mt: 0.25 }}>
                {descricao}
              </Typography>
            ) : null}
          </Box>
        </Stack>
        {acaoCabecalho}
      </Stack>
      {children}
    </Card>
  );
}
