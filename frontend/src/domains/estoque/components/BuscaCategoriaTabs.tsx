import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { Box, Button, Card, Grid, Stack, Tab, Tabs, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useBuscaCategoria, type CategoriaBusca } from '../hooks/useBuscaCategoria';
import type { LinhaOperacionalEstoque } from '../types/tiposEstoque';

const categorias: { id: CategoriaBusca; label: string; placeholder: string }[] = [
  { id: 'produto', label: 'Produtos', placeholder: 'Buscar produto...' },
  { id: 'medicamento', label: 'Medicamentos', placeholder: 'Buscar medicamento...' },
  { id: 'insumo', label: 'Insumos', placeholder: 'Buscar insumo...' },
];

type Props = {
  itens: LinhaOperacionalEstoque[];
  onSelecionarItem: (item: LinhaOperacionalEstoque) => void;
};

export function BuscaCategoriaTabs({ itens, onSelecionarItem }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedTab, setSelectedTab] = useState<CategoriaBusca>('produto');
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const { searchTerm, setSearchTerm, resultados } = useBuscaCategoria(itens, selectedTab);

  useEffect(() => {
    setSearchTerm('');
    setSelectedItemId(null);
  }, [selectedTab, setSearchTerm]);

  const categoriaAtual = useMemo(
    () => categorias.find((categoria) => categoria.id === selectedTab) ?? categorias[0],
    [selectedTab],
  );

  const resultadosVisiveis = searchTerm.trim().length === 0 ? resultados.slice(0, 6) : resultados.slice(0, 8);
  const mostrarVazio = searchTerm.trim().length > 0 && resultados.length === 0;
  const itemSelecionado = resultados.find((item) => item.id === selectedItemId) ?? null;

  function categoriaLabel(categoria: LinhaOperacionalEstoque['origem']) {
    if (categoria === 'produto') return 'Produto';
    if (categoria === 'medicamento') return 'Medicamento';
    return 'Insumo';
  }

  function renderLista() {
    return (
      <Stack spacing={2}>
        <Tabs
          value={selectedTab}
          onChange={(_, value: CategoriaBusca) => setSelectedTab(value)}
          variant="fullWidth"
          sx={{
            '& .MuiTabs-indicator': { backgroundColor: '#3b82f6', height: 3 },
            '& .MuiTab-root': { color: '#94a3b8', textTransform: 'none', fontWeight: 600 },
            '& .Mui-selected': { color: '#e2e8f0' },
          }}
        >
          {categorias.map((categoria) => (
            <Tab key={categoria.id} value={categoria.id} label={categoria.label} />
          ))}
        </Tabs>

        <TextField
          fullWidth
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder={categoriaAtual.placeholder}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: 'rgba(2, 6, 23, 0.65)',
              color: '#e2e8f0',
              '& fieldset': { borderColor: 'rgba(59,130,246,0.35)' },
              '&:hover fieldset': { borderColor: '#3b82f6' },
              '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
            },
            '& .MuiInputBase-input::placeholder': { color: '#94a3b8', opacity: 1 },
          }}
          slotProps={{
            input: {
              startAdornment: <SearchRoundedIcon sx={{ mr: 1, color: '#94a3b8' }} />,
            },
          }}
        />

        <Stack spacing={1}>
          {mostrarVazio ? (
            <Typography variant="body2" sx={{ color: '#94a3b8', py: 1 }}>
              Nenhum item encontrado.
            </Typography>
          ) : (
            resultadosVisiveis.map((item) => {
              const selecionado = item.id === selectedItemId;
              return (
                <Box
                  key={`${item.origem}-${item.id}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => (isMobile ? onSelecionarItem(item) : setSelectedItemId(item.id))}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      if (isMobile) onSelecionarItem(item);
                      else setSelectedItemId(item.id);
                    }
                  }}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: selecionado ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(71, 85, 105, 0.45)',
                    backgroundColor: selecionado ? 'rgba(59,130,246,0.1)' : 'rgba(2, 6, 23, 0.55)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      borderColor: 'rgba(59,130,246,0.6)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.28)',
                    },
                  }}
                >
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ color: '#e2e8f0', fontWeight: 600 }}>{item.nome}</Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                      {categoriaLabel(item.origem)}
                    </Typography>
                  </Stack>
                </Box>
              );
            })
          )}
        </Stack>
      </Stack>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
        backgroundColor: '#0f172a',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <Stack spacing={2}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#e2e8f0', textAlign: 'center', mb: 0.5 }}>
            Busca por categoria
          </Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', textAlign: 'center' }}>
            Selecione a categoria e pesquise pelo nome.
          </Typography>
        </Box>
        {isMobile ? (
          <Box>{renderLista()}</Box>
        ) : (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 5 }}>{renderLista()}</Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <Card
                sx={{
                  height: '100%',
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(148,163,184,0.16)',
                }}
              >
                {itemSelecionado ? (
                  <Stack spacing={2}>
                    <Typography variant="h6" sx={{ color: '#e2e8f0', fontWeight: 700 }}>
                      {itemSelecionado.nome}
                    </Typography>
                    <Typography sx={{ color: '#94a3b8' }}>
                      Categoria: {categoriaLabel(itemSelecionado.origem)}
                    </Typography>
                    <Box sx={{ borderTop: '1px solid rgba(148,163,184,0.16)', pt: 2 }}>
                      <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 0.75 }}>
                        Quantidade atual: {itemSelecionado.quantidade}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 0.75 }}>
                        Nível mínimo: {itemSelecionado.minimo}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                        Última movimentação: {itemSelecionado.ultimaMovimentacao}
                      </Typography>
                    </Box>
                    <Box>
                      <Button
                        variant="contained"
                        onClick={() => onSelecionarItem(itemSelecionado)}
                        sx={{
                          mt: 1,
                          backgroundColor: '#2563eb',
                          '&:hover': { backgroundColor: '#1d4ed8', transform: 'translateY(-2px)' },
                        }}
                      >
                        Ver detalhes
                      </Button>
                    </Box>
                  </Stack>
                ) : (
                  <Stack spacing={1.25}>
                    <Typography variant="h6" sx={{ color: '#e2e8f0' }}>
                      Selecione um item
                    </Typography>
                    <Typography sx={{ color: '#94a3b8' }}>
                      Escolha um produto, medicamento ou insumo para visualizar detalhes.
                    </Typography>
                  </Stack>
                )}
              </Card>
            </Grid>
          </Grid>
        )}
      </Stack>
    </Box>
  );
}
