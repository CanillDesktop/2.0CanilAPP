import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, Card, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { BotaoAlternarTema } from './BotaoAlternarTema';
import { useEstilosListagem } from '../theme/useEstilosListagem';

const MotionBox = motion(Box);

type LayoutProps = {
  titulo: string;
  subtitulo?: string;
  rotaVoltar: string;
  rotuloVoltar?: string;
  children: ReactNode;
};

export function LayoutFormularioCadastro({
  titulo,
  subtitulo,
  rotaVoltar,
  rotuloVoltar = 'Voltar',
  children,
}: LayoutProps) {
  const navigate = useNavigate();
  const estilos = useEstilosListagem();

  return (
    <section style={{ minHeight: '100vh', backgroundColor: estilos.cores.bgShell }}>
      <MotionBox initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
        <Stack sx={estilos.painel}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                variant="outlined"
                onClick={() => navigate(rotaVoltar)}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  borderColor: estilos.cores.borderForte,
                  color: estilos.cores.textPrimary,
                }}
              >
                {rotuloVoltar}
              </Button>
              <BotaoAlternarTema variante="icone" />
            </Stack>
            <Typography variant="h5" sx={estilos.titulo}>
              {titulo}
            </Typography>
          </Stack>

          {subtitulo ? (
            <Typography variant="body2" sx={estilos.legenda}>
              {subtitulo}
            </Typography>
          ) : null}

          {children}
        </Stack>
      </MotionBox>
    </section>
  );
}

type SecaoProps = {
  titulo: string;
  children: ReactNode;
  acaoCabecalho?: ReactNode;
};

export function SecaoFormularioCadastro({ titulo, children, acaoCabecalho }: SecaoProps) {
  const estilos = useEstilosListagem();

  return (
    <Card sx={{ ...estilos.cardTabela, p: { xs: 2, sm: 3 }, mb: 3 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 1,
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={estilos.titulo}>
          {titulo}
        </Typography>
        {acaoCabecalho}
      </Stack>
      {children}
    </Card>
  );
}
