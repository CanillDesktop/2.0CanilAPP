export type ModoTema = 'dark' | 'light';

/** Paleta oficial Canil (logo). */
export const MARCA = {
  roxo: '#703081',
  roxoEscuro: '#5E2968',
  roxoProfundo: '#3D1F45',
  teal: '#2EC1AC',
  tealEscuro: '#24A892',
  salmao: '#F07167',
  salmaoEscuro: '#E05A50',
} as const;

export type CoresApp = {
  bgShell: string;
  bgConteudo: string;
  bgPainel: string;
  bgCard: string;
  bgInput: string;
  bgCabecalhoTabela: string;
  bgLinhaExpandida: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textOnAccent: string;
  border: string;
  borderSuave: string;
  borderForte: string;
  accent: string;
  accentHover: string;
  brandHighlight: string;
  focus: string;
  focusRing: string;
  hoverSurface: string;
  hoverSurfaceStrong: string;
  sombraCard: string;
  gradienteLogin: string;
  chipBg: string;
  chipBorder: string;
  chipIcon: string;
  emptyBorder: string;
  sidebarBorder: string;
  alertMinimoBg: string;
  alertMinimoBorder: string;
  alertVencimentoBg: string;
  alertVencimentoBorder: string;
  alertItemBg: string;
  alertItemBorder: string;
  alertItemHoverBg: string;
  metricCardBg: string;
  metricCardBorder: string;
  acaoVisualizar: string;
  acaoEditar: string;
  acaoExcluir: string;
  acaoMovimentar: string;
};

const paletaDark: CoresApp = {
  bgShell: '#120e18',
  bgConteudo: '#16121e',
  bgPainel: '#16121e',
  bgCard: '#1f1929',
  bgInput: '#1a1524',
  bgCabecalhoTabela: '#1c1628',
  bgLinhaExpandida: '#14101c',
  textPrimary: '#f5f0f8',
  textSecondary: 'rgba(245, 240, 248, 0.82)',
  textMuted: '#a89bb3',
  textOnAccent: '#ffffff',
  border: 'rgba(255, 255, 255, 0.07)',
  borderSuave: 'rgba(255, 255, 255, 0.05)',
  borderForte: 'rgba(168, 155, 179, 0.32)',
  accent: MARCA.teal,
  accentHover: MARCA.tealEscuro,
  brandHighlight: MARCA.roxo,
  focus: MARCA.teal,
  focusRing: 'rgba(46, 193, 172, 0.28)',
  hoverSurface: 'rgba(46, 193, 172, 0.08)',
  hoverSurfaceStrong: 'rgba(112, 48, 129, 0.16)',
  sombraCard: '0 20px 50px rgba(0, 0, 0, 0.45)',
  gradienteLogin: `radial-gradient(ellipse 80% 60% at 10% 0%, rgba(112, 48, 129, 0.35), transparent 55%),
    radial-gradient(ellipse 60% 50% at 90% 100%, rgba(46, 193, 172, 0.18), transparent 50%),
    linear-gradient(160deg, #120e18 0%, ${MARCA.roxoProfundo} 48%, #16121e 100%)`,
  chipBg: 'rgba(112, 48, 129, 0.18)',
  chipBorder: 'rgba(46, 193, 172, 0.35)',
  chipIcon: MARCA.teal,
  emptyBorder: 'rgba(168, 155, 179, 0.35)',
  sidebarBorder: 'rgba(46, 193, 172, 0.12)',
  alertMinimoBg: 'rgba(240, 113, 103, 0.1)',
  alertMinimoBorder: 'rgba(240, 113, 103, 0.38)',
  alertVencimentoBg: 'rgba(46, 193, 172, 0.08)',
  alertVencimentoBorder: 'rgba(46, 193, 172, 0.32)',
  alertItemBg: 'rgba(20, 16, 28, 0.65)',
  alertItemBorder: 'rgba(168, 155, 179, 0.22)',
  alertItemHoverBg: 'rgba(112, 48, 129, 0.14)',
  metricCardBg: 'rgba(112, 48, 129, 0.14)',
  metricCardBorder: 'rgba(46, 193, 172, 0.28)',
  acaoVisualizar: MARCA.teal,
  acaoEditar: '#c4b5fd',
  acaoExcluir: MARCA.salmao,
  acaoMovimentar: '#7eead9',
};

const paletaLight: CoresApp = {
  bgShell: '#f3edf5',
  bgConteudo: '#faf8fb',
  bgPainel: '#faf8fb',
  bgCard: '#ffffff',
  bgInput: '#fdfcfe',
  bgCabecalhoTabela: '#ede4f1',
  bgLinhaExpandida: '#f7f2f9',
  textPrimary: '#2a1f30',
  textSecondary: '#5a4d62',
  textMuted: '#8a7a92',
  textOnAccent: '#ffffff',
  border: 'rgba(112, 48, 129, 0.12)',
  borderSuave: 'rgba(112, 48, 129, 0.08)',
  borderForte: 'rgba(112, 48, 129, 0.22)',
  accent: MARCA.roxo,
  accentHover: MARCA.roxoEscuro,
  brandHighlight: MARCA.teal,
  focus: MARCA.roxo,
  focusRing: 'rgba(112, 48, 129, 0.2)',
  hoverSurface: 'rgba(112, 48, 129, 0.06)',
  hoverSurfaceStrong: 'rgba(46, 193, 172, 0.1)',
  sombraCard: '0 16px 40px rgba(112, 48, 129, 0.1)',
  gradienteLogin: `radial-gradient(ellipse 70% 55% at 15% 10%, rgba(112, 48, 129, 0.12), transparent 50%),
    radial-gradient(ellipse 55% 45% at 85% 90%, rgba(46, 193, 172, 0.14), transparent 45%),
    linear-gradient(155deg, #faf8fb 0%, #f3edf5 45%, #ebe2ef 100%)`,
  chipBg: '#ffffff',
  chipBorder: 'rgba(112, 48, 129, 0.2)',
  chipIcon: MARCA.teal,
  emptyBorder: 'rgba(112, 48, 129, 0.25)',
  sidebarBorder: 'rgba(112, 48, 129, 0.14)',
  alertMinimoBg: 'rgba(240, 113, 103, 0.1)',
  alertMinimoBorder: 'rgba(240, 113, 103, 0.35)',
  alertVencimentoBg: 'rgba(46, 193, 172, 0.1)',
  alertVencimentoBorder: 'rgba(46, 193, 172, 0.35)',
  alertItemBg: '#ffffff',
  alertItemBorder: 'rgba(112, 48, 129, 0.14)',
  alertItemHoverBg: 'rgba(46, 193, 172, 0.08)',
  metricCardBg: 'rgba(112, 48, 129, 0.06)',
  metricCardBorder: 'rgba(46, 193, 172, 0.28)',
  acaoVisualizar: MARCA.tealEscuro,
  acaoEditar: MARCA.roxo,
  acaoExcluir: MARCA.salmaoEscuro,
  acaoMovimentar: MARCA.tealEscuro,
};

export function obterCoresApp(modo: ModoTema): CoresApp {
  return modo === 'light' ? paletaLight : paletaDark;
}

export const CHAVE_TEMA_LOCAL = 'canilapp-tema';
