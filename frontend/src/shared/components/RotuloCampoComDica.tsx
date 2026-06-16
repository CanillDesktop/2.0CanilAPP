import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, IconButton, Tooltip } from '@mui/material';
import { useTemaApp } from '../../app/providers/ContextoTemaApp';

type Props = {
  rotulo: string;
  dica: string;
};

export function RotuloCampoComDica({ rotulo, dica }: Props) {
  const { cores } = useTemaApp();

  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25, maxWidth: '100%' }}>
      <span>{rotulo}</span>
      <Tooltip title={dica} arrow placement="top" enterTouchDelay={0} leaveTouchDelay={4000}>
        <IconButton
          component="span"
          size="small"
          tabIndex={0}
          aria-label={`Informações sobre ${rotulo}`}
          onMouseDown={(e) => e.preventDefault()}
          sx={{
            p: 0.25,
            color: cores.textMuted,
            opacity: 0.9,
            verticalAlign: 'middle',
            '&:hover': { opacity: 1, color: cores.focus, backgroundColor: 'transparent' },
          }}
        >
          <InfoOutlinedIcon sx={{ fontSize: 17 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
