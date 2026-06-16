import { alpha } from '@mui/material/styles';
import { useTemaApp } from '../../app/providers/ContextoTemaApp';

export function useEstilosListagem() {
  const { cores } = useTemaApp();

  return {
    cores,
    painel: {
      gap: 3,
      backgroundColor: cores.bgPainel,
      borderRadius: 3,
      p: { xs: 1, sm: 1.5, md: 2 },
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
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box',
      '& .MuiTablePagination-toolbar': {
        minHeight: 52,
        width: '100%',
        maxWidth: '100%',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        rowGap: { xs: 0.5, sm: 0 },
        columnGap: { xs: 0.5, sm: 1 },
        px: { xs: 0.5, sm: 2 },
        py: { xs: 0.75, sm: 0 },
        '& .MuiTablePagination-spacer': {
          display: 'none',
        },
      },
      '& .MuiTablePagination-selectLabel': {
        fontSize: { xs: '0.75rem', sm: '0.875rem' },
        m: 0,
      },
      '& .MuiTablePagination-select': {
        fontSize: { xs: '0.75rem', sm: '0.875rem' },
        mr: { xs: 0.5, sm: 2 },
      },
      '& .MuiTablePagination-input': {
        mr: { xs: 0.5, sm: 2 },
      },
      '& .MuiTablePagination-displayedRows': {
        fontSize: { xs: '0.75rem', sm: '0.875rem' },
        m: 0,
        whiteSpace: 'nowrap',
      },
      '& .MuiTablePagination-actions': {
        marginLeft: { xs: 0, sm: 'auto' },
        flexShrink: 0,
      },
      '& .MuiTablePagination-selectIcon, & .MuiTablePagination-actions': { color: cores.textMuted },
    },
    cardTabela: {
      borderRadius: 3,
      backgroundColor: cores.bgCard,
      border: `1px solid ${cores.border}`,
      boxShadow: cores.sombraCard,
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
      boxShadow: cores.sombraCard,
      '&:hover': { transform: 'translateY(-1px)' },
    },
    botaoPrimario: {
      minHeight: 40,
      fontWeight: 700,
      borderRadius: 2,
      textTransform: 'none' as const,
      backgroundColor: cores.accent,
      color: cores.textOnAccent,
      boxShadow: 'none',
      '&:hover': {
        backgroundColor: cores.accentHover,
        boxShadow: `0 6px 16px ${alpha(cores.accent, 0.32)}`,
      },
    },
    iconeAcao: {
      visualizar: {
        color: cores.acaoVisualizar,
        '&:hover': { backgroundColor: alpha(cores.acaoVisualizar, 0.14), color: cores.acaoVisualizar },
      },
      editar: {
        color: cores.acaoEditar,
        '&:hover': { backgroundColor: alpha(cores.acaoEditar, 0.14), color: cores.acaoEditar },
      },
      excluir: {
        color: cores.acaoExcluir,
        '&:hover': { backgroundColor: alpha(cores.acaoExcluir, 0.14), color: cores.acaoExcluir },
      },
      movimentar: {
        color: cores.acaoMovimentar,
        '&:hover': { backgroundColor: alpha(cores.acaoMovimentar, 0.14), color: cores.acaoMovimentar },
      },
    },
  };
}
