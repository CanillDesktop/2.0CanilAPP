import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Box,
  Button,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { ItemEstoqueDto } from '../../../shared/types/itemEstoque';
import { LoteItem, type Lote } from './LoteItem';

const MotionBox = motion(Box);
const MotionIcon = motion.span;

async function buscarLotesMock(
  lotesOriginais: ItemEstoqueDto[],
  idItem: number,
): Promise<Lote[]> {
  await new Promise((resolve) => window.setTimeout(resolve, 650));

  const lotes = lotesOriginais
    .map((lote, idx) => ({
      id: `${idItem}-${lote.lote ?? idx}`,
      codigo: lote.lote ?? `L${idx + 1}`,
      quantidade: lote.quantidade,
      validade: lote.dataValidade ?? new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(),
    }))
    .sort((a, b) => new Date(a.validade).getTime() - new Date(b.validade).getTime());

  return lotes;
}

type LoteSectionProps = {
  idItem: number;
  codItem: string;
  produtoNome: string;
  lotesOriginais: ItemEstoqueDto[];
  onExcluirProduto: () => void;
};

export function LoteSection({ idItem, codItem, produtoNome, lotesOriginais, onExcluirProduto }: LoteSectionProps) {
  const navigate = useNavigate();
  const [openLotes, setOpenLotes] = useState(false);
  const [loadingLotes, setLoadingLotes] = useState(false);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [jaCarregou, setJaCarregou] = useState(false);

  useEffect(() => {
    let ativo = true;
    if (!openLotes || jaCarregou) return;

    setLoadingLotes(true);
    void buscarLotesMock(lotesOriginais, idItem)
      .then((dados) => {
        if (!ativo) return;
        setLotes(dados);
        setJaCarregou(true);
      })
      .finally(() => {
        if (ativo) setLoadingLotes(false);
      });

    return () => {
      ativo = false;
    };
  }, [openLotes, jaCarregou, lotesOriginais, idItem]);

  const titulo = useMemo(() => `Lotes (${jaCarregou ? lotes.length : lotesOriginais.length})`, [jaCarregou, lotes.length, lotesOriginais.length]);

  function handleRetirada(lote: Lote) {
    navigate('/estoque/retirada', {
      state: {
        produtoId: idItem,
        produtoNome,
        codItem,
        loteId: lote.id,
        loteCodigo: lote.codigo,
        quantidadeDisponivel: lote.quantidade,
        retornoRota: `/produtos/${idItem}`,
      },
    });
  }

  return (
    <Box sx={{ mt: 2, border: '1px solid rgba(255,255,255,0.12)', borderRadius: 3, p: 1.5 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">{titulo}</Typography>
        <IconButton onClick={() => setOpenLotes((prev) => !prev)} aria-label="Expandir lotes">
          <MotionIcon animate={{ rotate: openLotes ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ display: 'inline-flex' }}>
            {openLotes ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </MotionIcon>
        </IconButton>
      </Stack>

      <AnimatePresence initial={false}>
        {openLotes && (
          <MotionBox
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            sx={{ overflow: 'hidden' }}
          >
            <Stack sx={{ mt: 1.2, gap: 1 }}>
              {loadingLotes ? (
                <>
                  <Skeleton variant="rounded" height={56} />
                  <Skeleton variant="rounded" height={56} />
                  <Skeleton variant="rounded" height={56} />
                </>
              ) : lotes.length ? (
                <>
                  {lotes.map((lote) => (
                    <LoteItem key={lote.id} lote={lote} onRegistrarRetirada={handleRetirada} />
                  ))}
                </>
              ) : (
                <Box sx={{ p: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Nenhum lote cadastrado
                  </Typography>
                </Box>
              )}

              <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1, pt: 0.8 }}>
                <Button
                  component={Link}
                  to={`/estoque/lotes/novo?idItem=${idItem}&codItem=${encodeURIComponent(codItem)}`}
                  variant="contained"
                  size="large"
                >
                  Adicionar lote
                </Button>
                <Button variant="outlined" color="error" size="large" onClick={onExcluirProduto}>
                  Excluir produto
                </Button>
              </Stack>
            </Stack>
          </MotionBox>
        )}
      </AnimatePresence>
    </Box>
  );
}
