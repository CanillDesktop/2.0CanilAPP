import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  TextField,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { PainelFiltrosColapsavel } from '../../../shared/components/PainelFiltrosColapsavel';
import { estilosCampoFiltro, estilosLabelFiltro } from '../../../shared/theme/estilosCampos';
import { useUnidadesMedida } from '../../unidades-medida/hooks/useUnidadesMedida';
import { rotuloUnidadeMedida } from '../../unidades-medida/types/tiposUnidadeMedida';
import type { InsumoStatusEstoqueFiltro } from '../types/tiposInsumos';

const MotionButton = motion(Button);

type FilterBarInsumosProps = {
  busca: string;
  unidade: 'todas' | string;
  status: InsumoStatusEstoqueFiltro;
  dataEntrega: string;
  dataValidade: string;
  onBuscaChange: (valor: string) => void;
  onUnidadeChange: (valor: string) => void;
  onStatusChange: (valor: InsumoStatusEstoqueFiltro) => void;
  onDataEntregaChange: (valor: string) => void;
  onDataValidadeChange: (valor: string) => void;
  onLimpar: () => void;
  onNovoInsumo: () => void;
};

export function FilterBarInsumos({
  busca,
  unidade,
  status,
  dataEntrega,
  dataValidade,
  onBuscaChange,
  onUnidadeChange,
  onStatusChange,
  onDataEntregaChange,
  onDataValidadeChange,
  onLimpar,
  onNovoInsumo,
}: FilterBarInsumosProps) {
  const { cores } = useTemaApp();
  const { itens: unidades } = useUnidadesMedida('insumo');
  const inputSx = estilosCampoFiltro(cores);
  const labelSx = estilosLabelFiltro(cores);

  const filtrosAtivos = useMemo(() => {
    let n = 0;
    if (busca.trim()) n += 1;
    if (unidade !== 'todas') n += 1;
    if (status !== 'todos') n += 1;
    if (dataEntrega.trim()) n += 1;
    if (dataValidade.trim()) n += 1;
    return n;
  }, [busca, unidade, status, dataEntrega, dataValidade]);

  function handleStatusChange(e: SelectChangeEvent) {
    onStatusChange(e.target.value as InsumoStatusEstoqueFiltro);
  }

  return (
    <PainelFiltrosColapsavel filtrosAtivos={filtrosAtivos}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 5 }}>
          <TextField
            placeholder="Buscar por código, descrição, NF-e ou lote"
            variant="outlined"
            size="small"
            fullWidth
            value={busca}
            onChange={(e) => onBuscaChange(e.target.value)}
            sx={inputSx}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <FormControl size="small" fullWidth>
            <InputLabel sx={labelSx}>Unidade</InputLabel>
            <Select label="Unidade" value={unidade} onChange={(e) => onUnidadeChange(e.target.value)} sx={inputSx}>
              <MenuItem value="todas">Todas</MenuItem>
              {unidades.map((u) => (
                <MenuItem key={u.id} value={String(u.id)}>
                  {rotuloUnidadeMedida(u)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 6, md: 2 }}>
          <FormControl size="small" fullWidth>
            <InputLabel sx={labelSx}>Status</InputLabel>
            <Select label="Status" value={status} onChange={handleStatusChange} sx={inputSx}>
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="ativo">Ativos</MenuItem>
              <MenuItem value="a_vencer">A vencer</MenuItem>
              <MenuItem value="baixo">Baixo estoque</MenuItem>
              <MenuItem value="sem_estoque">Sem estoque</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: { md: 'flex-end' }, height: '100%' }}>
            <MotionButton
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
              variant="contained"
              startIcon={<AddOutlinedIcon />}
              onClick={onNovoInsumo}
              sx={{
                minHeight: 40,
                fontWeight: 700,
                borderRadius: 2,
                textTransform: 'none',
                width: { xs: '100%', md: 'auto' },
                backgroundColor: cores.accent,
                color: cores.textOnAccent,
                '&:hover': {
                  backgroundColor: cores.accentHover,
                },
              }}
            >
              Novo insumo
            </MotionButton>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            type="date"
            label="Data de entrega"
            value={dataEntrega}
            onChange={(e) => onDataEntregaChange(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={inputSx}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            type="date"
            label="Data de validade"
            value={dataValidade}
            onChange={(e) => onDataValidadeChange(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={inputSx}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Button variant="text" onClick={onLimpar} sx={{ color: cores.focus, fontWeight: 600, textTransform: 'none' }}>
              Limpar filtros
            </Button>
          </Box>
        </Grid>
      </Grid>
    </PainelFiltrosColapsavel>
  );
}
