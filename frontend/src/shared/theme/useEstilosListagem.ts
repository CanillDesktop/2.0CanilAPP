import { useTemaApp } from '../../app/providers/ContextoTemaApp';

export function useEstilosListagem() {
  const { cores } = useTemaApp();

  return {
    cores,
    painel: {
      gap: 3,
      backgroundColor: cores.bgPainel,
      borderRadius: 3,
      p: { xs: 1.5, md: 2 },
    },
    titulo: {
      fontWeight: 700,
      color: cores.textPrimary,
    },
    legenda: {
      color: cores.textMuted,
      px: 0.5,
    },
    estadoVazio: {
      border: `1px dashed ${cores.emptyBorder}`,
      borderRadius: 3,
      p: 3,
      backgroundColor: cores.bgCard,
    },
    paginacao: {
      color: cores.textPrimary,
      borderTop: `1px solid ${cores.borderSuave}`,
      '& .MuiTablePagination-toolbar': { minHeight: 52 },
      '& .MuiTablePagination-selectIcon, & .MuiTablePagination-actions': { color: cores.textMuted },
    },
    cardTabela: {
      borderRadius: 3,
      backgroundColor: cores.bgCard,
      border: `1px solid ${cores.border}`,
    },
    cabecalhoTabela: {
      backgroundColor: cores.bgCabecalhoTabela,
    },
    celulaCabecalho: {
      color: cores.textMuted,
      fontWeight: 600,
    },
    celulaTexto: {
      color: cores.textPrimary,
    },
    linhaExpandida: {
      p: 2,
      bgcolor: cores.bgLinhaExpandida,
    },
    cardMobile: {
      borderRadius: 3,
      backgroundColor: cores.bgCard,
      border: `1px solid ${cores.border}`,
      transition: 'transform 0.15s ease',
      '&:hover': { transform: 'translateY(-1px)' },
    },
    botaoPrimario: {
      minHeight: 40,
      fontWeight: 700,
      borderRadius: 2,
      textTransform: 'none' as const,
      backgroundColor: cores.accent,
      color: '#f8fafc',
      '&:hover': { backgroundColor: cores.accentHover },
    },
  };
}
