import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { IconButton, Stack, Tooltip } from '@mui/material';

type Props = {
  rotulo: string;
  dica: string;
};

export function RotuloCampoComDica({ rotulo, dica }: Props) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.25}
      component="span"
      sx={{ display: 'inline-flex', maxWidth: '100%' }}
    >
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
            color: 'inherit',
            opacity: 0.7,
            verticalAlign: 'middle',
            '&:hover': { opacity: 1, backgroundColor: 'transparent' },
          }}
        >
          <InfoOutlinedIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
