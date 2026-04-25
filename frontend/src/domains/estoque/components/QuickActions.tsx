import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import AutorenewOutlinedIcon from '@mui/icons-material/AutorenewOutlined';
import CallMadeOutlinedIcon from '@mui/icons-material/CallMadeOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { Card, CardActionArea, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);

export type AcaoRapida = {
  id: string;
  titulo: string;
  descricao: string;
  onClick: () => void;
  icone: 'produto' | 'entrada' | 'saida' | 'sincronizar';
};

function renderizarIcone(tipo: AcaoRapida['icone']) {
  if (tipo === 'produto') return <AddBoxOutlinedIcon fontSize="large" />;
  if (tipo === 'entrada') return <Inventory2OutlinedIcon fontSize="large" />;
  if (tipo === 'saida') return <CallMadeOutlinedIcon fontSize="large" />;
  return <AutorenewOutlinedIcon fontSize="large" />;
}

export function QuickActions({ acoes }: { acoes: AcaoRapida[] }) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ flexWrap: 'wrap', gap: 2 }}>
      {acoes.map((acao) => (
        <MotionCard
          key={acao.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 350, damping: 20 }}
          sx={{ flex: 1, minWidth: { xs: '100%', sm: 230 }, borderRadius: 3 }}
        >
          <CardActionArea
            onClick={acao.onClick}
            sx={{ p: 2.2, height: '100%', display: 'flex', justifyContent: 'flex-start' }}
          >
            <Stack direction="row" spacing={1.6} sx={{ alignItems: 'center' }}>
              {renderizarIcone(acao.icone)}
              <Stack>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {acao.titulo}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {acao.descricao}
                </Typography>
              </Stack>
            </Stack>
          </CardActionArea>
        </MotionCard>
      ))}
    </Stack>
  );
}
