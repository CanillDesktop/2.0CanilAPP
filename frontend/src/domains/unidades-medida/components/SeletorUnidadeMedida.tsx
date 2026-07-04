import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useUnidadesMedida } from '../hooks/useUnidadesMedida';
import type { TipoItemUnidadeMedida } from '../types/tiposUnidadeMedida';
import { rotuloUnidadeMedida } from '../types/tiposUnidadeMedida';

type Props = {
  tipo: TipoItemUnidadeMedida;
  value: number;
  onChange: (id: number) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  sx?: object;
};

export function SeletorUnidadeMedida({
  tipo,
  value,
  onChange,
  label = 'Como o item é medido',
  required = true,
  disabled = false,
  sx,
}: Props) {
  const { itens, carregando } = useUnidadesMedida(tipo);
  const valorSeguro = itens.some((u) => u.id === value) ? value : (itens[0]?.id ?? '');

  return (
    <FormControl fullWidth required={required} disabled={disabled || carregando || itens.length === 0} sx={sx}>
      <InputLabel id={`unidade-medida-${tipo}-label`}>{label}</InputLabel>
      <Select
        labelId={`unidade-medida-${tipo}-label`}
        label={label}
        value={valorSeguro}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {itens.map((u) => (
          <MenuItem key={u.id} value={u.id}>
            {rotuloUnidadeMedida(u)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
