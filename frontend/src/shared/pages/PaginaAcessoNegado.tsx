import { ErrorOutlined as ErrorOutlineIcon } from '@mui/icons-material';
import { Alert, Box, Button, Container, Paper, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export function PaginaAcessoNegado() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3 }}>
        <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
          <ErrorOutlineIcon sx={{ fontSize: 48, color: 'warning.main' }} aria-hidden />
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
            Acesso negado
          </Typography>
          <Alert severity="error" sx={{ width: '100%', textAlign: 'left' }}>
            Você não tem permissão para acessar este recurso.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Se você acredita que isso é um erro, fale com um administrador do sistema.
          </Typography>
          <Box sx={{ pt: 1 }}>
            <Button variant="contained" size="large" onClick={() => navigate('/dashboard', { replace: true })}>
              Voltar ao início
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}
