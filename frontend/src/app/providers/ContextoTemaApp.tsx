import { CssBaseline, ThemeProvider } from '@mui/material';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Theme } from '@mui/material/styles';
import { criarTemaMui } from '../../shared/theme/criarTemaMui';
import { CHAVE_TEMA_LOCAL, obterCoresApp, type CoresApp, type ModoTema } from '../../shared/theme/tokensTema';

type ContextoTemaAppValor = {
  modo: ModoTema;
  cores: CoresApp;
  temaMui: Theme;
  alternarTema: () => void;
  definirModo: (modo: ModoTema) => void;
};

const ContextoTemaApp = createContext<ContextoTemaAppValor | null>(null);

function lerModoSalvo(): ModoTema {
  if (typeof window === 'undefined') return 'dark';
  const salvo = window.localStorage.getItem(CHAVE_TEMA_LOCAL);
  return salvo === 'light' ? 'light' : 'dark';
}

export function ProvedorTemaApp({ children }: { children: ReactNode }) {
  const [modo, setModo] = useState<ModoTema>(lerModoSalvo);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', modo);
    window.localStorage.setItem(CHAVE_TEMA_LOCAL, modo);
  }, [modo]);

  const alternarTema = useCallback(() => {
    setModo((atual) => (atual === 'dark' ? 'light' : 'dark'));
  }, []);

  const definirModo = useCallback((novoModo: ModoTema) => {
    setModo(novoModo);
  }, []);

  const cores = useMemo(() => obterCoresApp(modo), [modo]);
  const temaMui = useMemo(() => criarTemaMui(modo), [modo]);

  const valor = useMemo(
    () => ({ modo, cores, temaMui, alternarTema, definirModo }),
    [modo, cores, temaMui, alternarTema, definirModo],
  );

  return (
    <ContextoTemaApp.Provider value={valor}>
      <ThemeProvider theme={temaMui}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ContextoTemaApp.Provider>
  );
}

export function useTemaApp() {
  const ctx = useContext(ContextoTemaApp);
  if (!ctx) {
    throw new Error('useTemaApp deve ser usado dentro de ProvedorTemaApp');
  }
  return ctx;
}
