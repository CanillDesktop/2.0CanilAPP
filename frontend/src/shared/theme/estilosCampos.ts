import type { CoresApp } from './tokensTema';

export function estilosCampoFiltro(cores: CoresApp) {
  return {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      backgroundColor: cores.bgInput,
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: cores.borderForte,
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: cores.focus,
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: cores.focus,
        boxShadow: `0 0 0 2px ${cores.focusRing}`,
      },
    },
    '& .MuiInputBase-input': {
      color: cores.textPrimary,
    },
    '& .MuiInputLabel-root': {
      color: cores.textMuted,
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: cores.focus,
    },
    '& .MuiSelect-icon': {
      color: cores.textMuted,
    },
    '& .MuiSelect-select': {
      color: cores.textPrimary,
    },
  };
}

export function estilosLabelFiltro(cores: CoresApp) {
  return {
    color: cores.textMuted,
    backgroundColor: cores.bgCard,
    px: 0.5,
    '&.Mui-focused': {
      color: cores.focus,
    },
  };
}

export function estilosCampoFormulario(cores: CoresApp) {
  return {
    '& .MuiInputLabel-root': {
      color: cores.textMuted,
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: cores.focus,
    },
    '& .MuiInputBase-input': {
      color: cores.textPrimary,
    },
    '& .MuiInputAdornment-root': {
      color: cores.textMuted,
    },
    '& .MuiOutlinedInput-root': {
      minHeight: 54,
      borderRadius: 2,
      backgroundColor: cores.bgInput,
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: cores.borderForte,
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: cores.focus,
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: cores.focus,
        boxShadow: `0 0 0 2px ${cores.focusRing}`,
      },
    },
  };
}
