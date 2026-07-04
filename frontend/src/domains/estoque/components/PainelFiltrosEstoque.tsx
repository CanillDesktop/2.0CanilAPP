import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { useMemo } from 'react';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { PainelFiltrosColapsavel } from '../../../shared/components/PainelFiltrosColapsavel';
import { estilosCampoFiltro } from '../../../shared/theme/estilosCampos';
import type { LinhaOperacionalEstoque } from '../types/tiposEstoque';

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  statusFiltro: '' | LinhaOperacionalEstoque['status'];
  onStatusChange: (value: '' | LinhaOperacionalEstoque['status']) => void;
  qtdMin: string;
  onQtdMinChange: (value: string) => void;
  qtdMax: string;
  onQtdMaxChange: (value: string) => void;
  validadeDe: string;
  onValidadeDeChange: (value: string) => void;
  validadeAte: string;
  onValidadeAteChange: (value: string) => void;
  movDe: string;
  onMovDeChange: (value: string) => void;
  movAte: string;
  onMovAteChange: (value: string) => void;
  onLimpar: () => void;
};

export function PainelFiltrosEstoque({
  search,
  onSearchChange,
  statusFiltro,
  onStatusChange,
  qtdMin,
  onQtdMinChange,
  qtdMax,
  onQtdMaxChange,
  validadeDe,
  onValidadeDeChange,
  validadeAte,
  onValidadeAteChange,
  movDe,
  onMovDeChange,
  movAte,
  onMovAteChange,
  onLimpar,
}: Props) {
  const { cores } = useTemaApp();
  const sxField = estilosCampoFiltro(cores);

  const filtrosAtivos = useMemo(() => {
    let n = 0;
    if (search.trim()) n += 1;
    if (statusFiltro) n += 1;
    if (qtdMin.trim()) n += 1;
    if (qtdMax.trim()) n += 1;
    if (validadeDe.trim()) n += 1;
    if (validadeAte.trim()) n += 1;
    if (movDe.trim()) n += 1;
    if (movAte.trim()) n += 1;
    return n;
  }, [search, statusFiltro, qtdMin, qtdMax, validadeDe, validadeAte, movDe, movAte]);

  return (
    <PainelFiltrosColapsavel filtrosAtivos={filtrosAtivos}>
      <Stack spacing={2}>
        <TextField
          fullWidth
          size="small"
          label="Buscar por nome"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Digite para filtrar..."
          sx={sxField}
        />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControl fullWidth size="small" sx={sxField}>
              <InputLabel id="filtro-status">Status</InputLabel>
              <Select
                labelId="filtro-status"
                label="Status"
                value={statusFiltro}
                onChange={(e) => onStatusChange(e.target.value as '' | LinhaOperacionalEstoque['status'])}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="ok">OK</MenuItem>
                <MenuItem value="baixo">Abaixo do mínimo</MenuItem>
                <MenuItem value="proximo_vencimento">Próximo vencimento</MenuItem>
                <MenuItem value="critico">Crítico</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="Qtd. mín."
              type="number"
              value={qtdMin}
              onChange={(e) => onQtdMinChange(e.target.value)}
              sx={sxField}
              slotProps={{ htmlInput: { min: 0 } }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="Qtd. máx."
              type="number"
              value={qtdMax}
              onChange={(e) => onQtdMaxChange(e.target.value)}
              sx={sxField}
              slotProps={{ htmlInput: { min: 0 } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Validade (de)"
              type="date"
              value={validadeDe}
              onChange={(e) => onValidadeDeChange(e.target.value)}
              sx={sxField}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Validade (até)"
              type="date"
              value={validadeAte}
              onChange={(e) => onValidadeAteChange(e.target.value)}
              sx={sxField}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Movimentação (de)"
              type="date"
              value={movDe}
              onChange={(e) => onMovDeChange(e.target.value)}
              sx={sxField}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Movimentação (até)"
              type="date"
              value={movAte}
              onChange={(e) => onMovAteChange(e.target.value)}
              sx={sxField}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
        </Grid>

        <Box>
          <Button variant="text" onClick={onLimpar} sx={{ color: cores.focus, fontWeight: 600, textTransform: 'none' }}>
            Limpar filtros
          </Button>
        </Box>
      </Stack>
    </PainelFiltrosColapsavel>
  );
}
