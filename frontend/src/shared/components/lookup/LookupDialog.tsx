import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { estilosCampoFormulario } from '../../theme/estilosCampos';
import { useEstilosListagem } from '../../theme/useEstilosListagem';

export type LookupColuna<T> = {
  id: string;
  rotulo: string;
  alinhamento?: 'left' | 'right' | 'center';
  render: (item: T) => ReactNode;
};

export type LookupDialogProps<T> = {
  aberto: boolean;
  titulo: string;
  placeholderBusca: string;
  dicaBusca?: string;
  buscaMinCaracteres?: number;
  /** Quando true, carrega resultados mesmo com campo de busca vazio (ex.: lotes do item). */
  permiteBuscaVazia?: boolean;
  colunas: LookupColuna<T>[];
  itens: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange?: (rows: number) => void;
  carregando: boolean;
  busca: string;
  onBuscaChange: (valor: string) => void;
  getChave: (item: T) => string;
  onSelecionar: (item: T) => void;
  onFechar: () => void;
};

export function LookupDialog<T>({
  aberto,
  titulo,
  placeholderBusca,
  dicaBusca = 'F2 abre · Enter seleciona · Esc fecha · ↑↓ navega',
  buscaMinCaracteres = 2,
  permiteBuscaVazia = false,
  colunas,
  itens,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onRowsPerPageChange,
  carregando,
  busca,
  onBuscaChange,
  getChave,
  onSelecionar,
  onFechar,
}: LookupDialogProps<T>) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { cores } = useTemaApp();
  const estilos = useEstilosListagem();
  const campoSx = estilosCampoFormulario(cores);
  const inputRef = useRef<HTMLInputElement>(null);
  const [indiceAtivo, setIndiceAtivo] = useState(0);

  const buscaPermitida = permiteBuscaVazia
    ? true
    : busca.trim().length === 0
      ? false
      : /^\d+$/.test(busca.trim()) || busca.trim().length >= buscaMinCaracteres;

  const selecionar = useCallback(
    (item: T) => {
      onSelecionar(item);
      onFechar();
    },
    [onFechar, onSelecionar],
  );

  useEffect(() => {
    if (!aberto) return;
    setIndiceAtivo(0);
    const timeout = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(timeout);
  }, [aberto]);

  useEffect(() => {
    setIndiceAtivo(0);
  }, [itens, page, busca]);

  useEffect(() => {
    if (!aberto) return;

    function aoTeclar(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onFechar();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setIndiceAtivo((atual) => Math.min(atual + 1, Math.max(0, itens.length - 1)));
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setIndiceAtivo((atual) => Math.max(atual - 1, 0));
        return;
      }

      if (e.key === 'Enter' && itens.length > 0 && document.activeElement !== inputRef.current) {
        e.preventDefault();
        const item = itens[indiceAtivo];
        if (item) selecionar(item);
      }
    }

    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [aberto, indiceAtivo, itens, onFechar, selecionar]);

  const conteudoLista = (() => {
    if (!buscaPermitida) {
      return (
        <Box sx={{ py: 4, px: 2, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: cores.textSecondary }}>
            {permiteBuscaVazia
              ? 'Aguardando consulta…'
              : `Digite pelo menos ${buscaMinCaracteres} caracteres (ou o ID numérico) para pesquisar.`}
          </Typography>
        </Box>
      );
    }

    if (carregando && itens.length === 0) {
      return (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" sx={{ color: cores.textSecondary }}>
            Buscando…
          </Typography>
        </Stack>
      );
    }

    if (!carregando && itens.length === 0) {
      return (
        <Box sx={{ py: 4, px: 2, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: cores.textSecondary }}>
            Nenhum resultado nesta unidade.
          </Typography>
        </Box>
      );
    }

    if (isMobile) {
      return (
        <Stack spacing={1} sx={{ py: 0.5 }}>
          {itens.map((item, idx) => (
            <Box
              key={getChave(item)}
              role="button"
              tabIndex={0}
              onClick={() => selecionar(item)}
              onDoubleClick={() => selecionar(item)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  selecionar(item);
                }
              }}
              sx={{
                ...estilos.cardMobile,
                p: 1.5,
                cursor: 'pointer',
                borderColor: idx === indiceAtivo ? cores.focus : cores.border,
                bgcolor: idx === indiceAtivo ? cores.hoverSurfaceStrong : cores.bgCard,
              }}
            >
              <Stack spacing={0.75}>
                {colunas.map((col) => (
                  <Box key={col.id}>
                    <Typography variant="caption" sx={{ color: cores.textMuted, display: 'block' }}>
                      {col.rotulo}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: cores.textPrimary, wordBreak: 'break-word' }}>
                      {col.render(item)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>
      );
    }

    return (
      <TableContainer sx={{ maxHeight: 360 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {colunas.map((col) => (
                <TableCell key={col.id} align={col.alinhamento ?? 'left'} sx={{ fontWeight: 700 }}>
                  {col.rotulo}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {itens.map((item, idx) => (
              <TableRow
                key={getChave(item)}
                hover
                selected={idx === indiceAtivo}
                tabIndex={0}
                sx={{ cursor: 'pointer' }}
                onClick={() => setIndiceAtivo(idx)}
                onDoubleClick={() => selecionar(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selecionar(item);
                  }
                }}
              >
                {colunas.map((col) => (
                  <TableCell key={col.id} align={col.alinhamento ?? 'left'}>
                    {col.render(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  })();

  return (
    <Dialog
      open={aberto}
      onClose={onFechar}
      fullScreen={isMobile}
      maxWidth="md"
      fullWidth
      aria-labelledby="lookup-dialog-titulo"
      slotProps={{
        paper: {
          sx: isMobile
            ? { display: 'flex', flexDirection: 'column', maxHeight: '100dvh' }
            : undefined,
        },
      }}
    >
      <DialogTitle
        id="lookup-dialog-titulo"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          pb: 1,
          fontWeight: 800,
          flexShrink: 0,
          pr: 1,
        }}
      >
        <Typography
          component="span"
          variant="h6"
          sx={{ fontWeight: 800, flex: 1, minWidth: 0, wordBreak: 'break-word', lineHeight: 1.3 }}
        >
          {titulo}
        </Typography>
        <IconButton onClick={onFechar} aria-label="Fechar" sx={{ minWidth: 44, minHeight: 44, flexShrink: 0 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          pt: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          minHeight: isMobile ? 0 : 320,
          flex: isMobile ? 1 : undefined,
          overflow: 'hidden',
          pb: isMobile ? 'max(12px, env(safe-area-inset-bottom))' : undefined,
        }}
      >
        <TextField
          fullWidth
          inputRef={inputRef}
          value={busca}
          onChange={(e) => onBuscaChange(e.target.value)}
          placeholder={placeholderBusca}
          sx={campoSx}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && itens.length > 0) {
              e.preventDefault();
              const item = itens[indiceAtivo] ?? itens[0];
              if (item) selecionar(item);
            }
            if (e.key === 'ArrowDown' && itens.length > 0) {
              e.preventDefault();
              setIndiceAtivo(0);
            }
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ color: cores.textMuted }} />
                </InputAdornment>
              ),
            },
          }}
        />
        <Typography variant="caption" sx={{ color: cores.textMuted, flexShrink: 0 }}>
          {isMobile ? 'Toque para selecionar · Esc fecha' : dicaBusca}
        </Typography>
        {carregando ? <LinearProgress sx={{ borderRadius: 1, flexShrink: 0 }} /> : null}
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>{conteudoLista}</Box>
        {buscaPermitida && totalCount > 0 ? (
          <TablePagination
            component="div"
            sx={estilos.paginacao}
            count={totalCount}
            page={page}
            rowsPerPage={pageSize}
            onPageChange={(_, novaPagina) => onPageChange(novaPagina)}
            onRowsPerPageChange={
              onRowsPerPageChange
                ? (e) => {
                    onRowsPerPageChange(parseInt(e.target.value, 10));
                    onPageChange(0);
                  }
                : undefined
            }
            rowsPerPageOptions={onRowsPerPageChange ? [10, 20, 50] : [pageSize]}
            labelRowsPerPage="Por página"
            labelDisplayedRows={({ from, to, count }) =>
              count === 0 ? '0–0 de 0' : `${from}–${to} de ${count}`
            }
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
