import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { Button, IconButton, ListItemButton, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import { useTemaApp } from '../../app/providers/ContextoTemaApp';

type Props = {
  variante?: 'menu' | 'icone' | 'botao';
};

export function BotaoAlternarTema({ variante = 'menu' }: Props) {
  const { modo, alternarTema } = useTemaApp();
  const proximoModo = modo === 'dark' ? 'claro' : 'escuro';
  const rotulo = modo === 'dark' ? 'Modo claro' : 'Modo escuro';
  const Icone = modo === 'dark' ? LightModeOutlinedIcon : DarkModeOutlinedIcon;

  if (variante === 'icone') {
    return (
      <Tooltip title={`Ativar modo ${proximoModo}`}>
        <IconButton onClick={alternarTema} aria-label={rotulo} color="inherit">
          <Icone />
        </IconButton>
      </Tooltip>
    );
  }

  if (variante === 'botao') {
    return (
      <Button
        variant="outlined"
        startIcon={<Icone />}
        onClick={alternarTema}
        sx={{ textTransform: 'none', borderRadius: 2 }}
      >
        {rotulo}
      </Button>
    );
  }

  return (
    <ListItemButton onClick={alternarTema} sx={{ borderRadius: 2, mt: 0.5 }}>
      <ListItemIcon sx={{ minWidth: 36 }}>
        <Icone fontSize="small" />
      </ListItemIcon>
      <ListItemText primary={rotulo} secondary={modo === 'dark' ? 'Tema atual: escuro' : 'Tema atual: claro'} />
    </ListItemButton>
  );
}
