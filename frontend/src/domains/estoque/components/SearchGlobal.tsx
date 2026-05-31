import SearchIcon from '@mui/icons-material/Search';
import { Autocomplete, Box, InputAdornment, TextField, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { useTemaApp } from '../../../app/providers/ContextoTemaApp';
import { estilosCampoFiltro } from '../../../shared/theme/estilosCampos';
import { MARCA } from '../../../shared/theme/tokensTema';
import { useBuscaGlobal } from '../hooks/useBuscaGlobal';
import type { BuscaGlobalItem } from '../services/buscaService';

type Props = {
  onSelecionar: (item: BuscaGlobalItem) => void;
};

function labelTipo(tipo: BuscaGlobalItem['tipo']) {
  if (tipo === 'medicamento') return 'Medicamento';
  if (tipo === 'insumo') return 'Insumo';
  return 'Produto retirada';
}

export function SearchGlobal({ onSelecionar }: Props) {
  const { cores } = useTemaApp();
  const inputSx = estilosCampoFiltro(cores);
  const [valorInput, setValorInput] = useState('');
  const [selecionado, setSelecionado] = useState<BuscaGlobalItem | null>(null);
  const { resultados, carregando, erro } = useBuscaGlobal(valorInput);

  const semResultado = useMemo(() => valorInput.trim().length >= 2 && !carregando && resultados.length === 0, [valorInput, carregando, resultados.length]);

  return (
    <Box sx={{ width: '100%', maxWidth: 760, mx: 'auto' }}>
      <Autocomplete
        fullWidth
        options={resultados}
        loading={carregando}
        value={selecionado}
        onChange={(_, item) => {
          setSelecionado(item);
          if (item) onSelecionar(item);
        }}
        inputValue={valorInput}
        onInputChange={(_, valor) => setValorInput(valor)}
        noOptionsText={valorInput.trim().length < 2 ? 'Digite ao menos 2 caracteres' : 'Nenhum resultado encontrado'}
        getOptionLabel={(option) => option.nome}
        isOptionEqualToValue={(option, value) => option.id === value.id && option.tipo === value.tipo}
        renderOption={(props, option) => (
          <Box component="li" {...props} key={`${option.tipo}-${option.id}`}>
            <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', gap: 1 }}>
              <Typography sx={{ color: cores.textPrimary }}>{option.nome}</Typography>
              <Typography variant="caption" sx={{ color: cores.textMuted }}>
                {labelTipo(option.tipo)}
              </Typography>
            </Box>
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Buscar medicamento, insumo ou produto para retirada..."
            onKeyDown={(event) => {
              if (event.key === 'Enter' && resultados.length > 0 && !selecionado) {
                onSelecionar(resultados[0]);
              }
            }}
            sx={{
              ...inputSx,
              '& .MuiOutlinedInput-root': {
                ...inputSx['& .MuiOutlinedInput-root'],
                minHeight: 56,
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: cores.chipIcon }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        )}
      />
      {erro && (
        <Typography variant="caption" sx={{ color: MARCA.salmao, mt: 1, display: 'block' }}>
          {erro}
        </Typography>
      )}
      {semResultado && !erro && (
        <Typography variant="caption" sx={{ color: cores.textMuted, mt: 1, display: 'block' }}>
          Nenhum resultado encontrado
        </Typography>
      )}
    </Box>
  );
}
