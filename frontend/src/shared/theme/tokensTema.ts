export type ModoTema = 'dark' | 'light';

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
  border: string;
  borderSuave: string;
  borderForte: string;
  accent: string;
  accentHover: string;
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
};

const paletaDark: CoresApp = {
  bgShell: '#020617',
  bgConteudo: '#040b1f',
  bgPainel: '#020617',
  bgCard: '#0f172a',
  bgInput: '#020617',
  bgCabecalhoTabela: '#020617',
  bgLinhaExpandida: '#020617',
  textPrimary: '#e2e8f0',
  textSecondary: 'rgba(203, 213, 225, 0.85)',
  textMuted: '#94a3b8',
  border: 'rgba(255,255,255,0.05)',
  borderSuave: 'rgba(255,255,255,0.06)',
  borderForte: 'rgba(148, 163, 184, 0.35)',
  accent: '#2563eb',
  accentHover: '#1d4ed8',
  focus: '#38bdf8',
  focusRing: 'rgba(56, 189, 248, 0.22)',
  hoverSurface: 'rgba(255,255,255,0.03)',
  hoverSurfaceStrong: 'rgba(255,255,255,0.02)',
  sombraCard: '0 26px 80px rgba(0, 0, 0, 0.42)',
  gradienteLogin:
    'radial-gradient(circle at top left, rgba(37, 99, 235, 0.22), transparent 34%), linear-gradient(135deg, #020617 0%, #040b1f 48%, #0f172a 100%)',
  chipBg: 'rgba(15, 23, 42, 0.82)',
  chipBorder: 'rgba(148, 163, 184, 0.24)',
  chipIcon: '#7dd3fc',
  emptyBorder: 'rgba(255,255,255,0.3)',
  sidebarBorder: 'rgba(255,255,255,0.08)',
  alertMinimoBg: 'rgba(127, 29, 29, 0.12)',
  alertMinimoBorder: 'rgba(248, 113, 113, 0.24)',
  alertVencimentoBg: 'rgba(113, 63, 18, 0.12)',
  alertVencimentoBorder: 'rgba(251, 191, 36, 0.24)',
  alertItemBg: 'rgba(2, 6, 23, 0.55)',
  alertItemBorder: 'rgba(71, 85, 105, 0.45)',
  alertItemHoverBg: 'rgba(15, 23, 42, 0.85)',
  metricCardBg: 'rgba(37, 99, 235, 0.08)',
  metricCardBorder: 'rgba(37, 99, 235, 0.28)',
};

const paletaLight: CoresApp = {
  bgShell: '#f0f7ff',
  bgConteudo: '#ffffff',
  bgPainel: '#ffffff',
  bgCard: '#ffffff',
  bgInput: '#ffffff',
  bgCabecalhoTabela: '#e8f2ff',
  bgLinhaExpandida: '#f8fbff',
  textPrimary: '#0f172a',
  textSecondary: 'rgba(51, 65, 85, 0.92)',
  textMuted: '#64748b',
  border: 'rgba(148, 163, 184, 0.28)',
  borderSuave: 'rgba(148, 163, 184, 0.2)',
  borderForte: 'rgba(148, 163, 184, 0.45)',
  accent: '#2563eb',
  accentHover: '#1d4ed8',
  focus: '#2563eb',
  focusRing: 'rgba(37, 99, 235, 0.18)',
  hoverSurface: 'rgba(37, 99, 235, 0.06)',
  hoverSurfaceStrong: 'rgba(37, 99, 235, 0.04)',
  sombraCard: '0 18px 48px rgba(37, 99, 235, 0.12)',
  gradienteLogin:
    'radial-gradient(circle at top left, rgba(37, 99, 235, 0.14), transparent 38%), linear-gradient(135deg, #f8fbff 0%, #eef5ff 48%, #e0edff 100%)',
  chipBg: '#ffffff',
  chipBorder: 'rgba(148, 163, 184, 0.35)',
  chipIcon: '#2563eb',
  emptyBorder: 'rgba(148, 163, 184, 0.45)',
  sidebarBorder: 'rgba(148, 163, 184, 0.28)',
  alertMinimoBg: '#e8f2ff',
  alertMinimoBorder: 'rgba(37, 99, 235, 0.38)',
  alertVencimentoBg: '#dbeafe',
  alertVencimentoBorder: 'rgba(59, 130, 246, 0.42)',
  alertItemBg: '#ffffff',
  alertItemBorder: 'rgba(148, 163, 184, 0.35)',
  alertItemHoverBg: '#f0f7ff',
  metricCardBg: '#e8f2ff',
  metricCardBorder: 'rgba(37, 99, 235, 0.32)',
};

export function obterCoresApp(modo: ModoTema): CoresApp {
  return modo === 'light' ? paletaLight : paletaDark;
}

export const CHAVE_TEMA_LOCAL = 'canilapp-tema';
