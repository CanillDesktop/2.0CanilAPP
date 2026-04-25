import SearchIcon from '@mui/icons-material/Search';
import { Autocomplete, Box, InputAdornment, TextField, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
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
              <Typography sx={{ color: '#e2e8f0' }}>{option.nome}</Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
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
              '& .MuiOutlinedInput-root': {
                minHeight: 56,
                backgroundColor: '#0f172a',
                color: '#e2e8f0',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
                '&:hover fieldset': { borderColor: '#3b82f6' },
                '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
              },
              '& .MuiInputBase-input::placeholder': {
                color: '#94a3b8',
                opacity: 1,
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        )}
      />
      {erro && (
        <Typography variant="caption" sx={{ color: '#fca5a5', mt: 1, display: 'block' }}>
          {erro}
        </Typography>
      )}
      {semResultado && !erro && (
        <Typography variant="caption" sx={{ color: '#94a3b8', mt: 1, display: 'block' }}>
          Nenhum resultado encontrado
        </Typography>
      )}
    </Box>
  );
}
