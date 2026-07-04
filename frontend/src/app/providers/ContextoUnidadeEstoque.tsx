import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAutenticacao } from './ContextoAutenticacao';
import { obterContextoUnidadeEstoqueApi } from '../../domains/estoque/api/unidadesEstoqueApi';
import type { ContextoUnidadeEstoqueDto, PermissoesUnidadeAtiva } from '../../domains/estoque/types/tiposUnidadeEstoque';
import {
  limparUnidadeAtivaId,
  obterUnidadeAtivaId,
  salvarUnidadeAtivaId,
} from '../../shared/services/armazenamentoUnidadeEstoque';
import { listarUnidadesEstoqueUsuarioApi } from '../../domains/usuarios/api/usuariosApi';
import type { UsuarioUnidadeEstoqueDto } from '../../domains/usuarios/types/tiposUsuarios';

type ContextoUnidadeEstoqueValor = {
  carregando: boolean;
  erro: string | null;
  contexto: ContextoUnidadeEstoqueDto | null;
  unidadeAtivaId: number | null;
  permissoesAtivas: PermissoesUnidadeAtiva | null;
  vinculosUsuario: UsuarioUnidadeEstoqueDto[];
  definirUnidadeAtiva: (id: number) => void;
  recarregarContexto: () => Promise<void>;
};

const permissoesPadraoNegadas: PermissoesUnidadeAtiva = {
  podeConsultar: false,
  podeEntrada: false,
  podeSaida: false,
  podeTransferirEnviar: false,
  podeTransferirReceber: false,
};

const ContextoUnidadeEstoque = createContext<ContextoUnidadeEstoqueValor | null>(null);

function permissoesDeVinculo(vinculo: UsuarioUnidadeEstoqueDto | undefined): PermissoesUnidadeAtiva {
  if (!vinculo) return permissoesPadraoNegadas;
  return {
    podeConsultar: vinculo.podeConsultar,
    podeEntrada: vinculo.podeEntrada,
    podeSaida: vinculo.podeSaida,
    podeTransferirEnviar: vinculo.podeTransferirEnviar,
    podeTransferirReceber: vinculo.podeTransferirReceber,
  };
}

export function ProvedorUnidadeEstoque({ children }: { children: ReactNode }) {
  const { autenticado, usuario } = useAutenticacao();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [contexto, setContexto] = useState<ContextoUnidadeEstoqueDto | null>(null);
  const [unidadeAtivaId, setUnidadeAtivaId] = useState<number | null>(null);
  const [vinculosUsuario, setVinculosUsuario] = useState<UsuarioUnidadeEstoqueDto[]>([]);

  const recarregarContexto = useCallback(async () => {
    if (!autenticado) {
      setContexto(null);
      setUnidadeAtivaId(null);
      setVinculosUsuario([]);
      setErro(null);
      return;
    }

    setCarregando(true);
    setErro(null);
    try {
      const [ctx, vinculos] = await Promise.all([
        obterContextoUnidadeEstoqueApi(),
        usuario?.id ? listarUnidadesEstoqueUsuarioApi(usuario.id) : Promise.resolve([]),
      ]);

      setContexto(ctx);
      setVinculosUsuario(vinculos);

      const idsDisponiveis = new Set(ctx.unidadesDisponiveis.map((u) => u.id));
      const preferida = obterUnidadeAtivaId();
      const idAtivo =
        preferida && idsDisponiveis.has(preferida)
          ? preferida
          : idsDisponiveis.has(ctx.unidadeAtivaId)
            ? ctx.unidadeAtivaId
            : ctx.unidadesDisponiveis[0]?.id ?? null;

      if (idAtivo != null) {
        salvarUnidadeAtivaId(idAtivo);
        setUnidadeAtivaId(idAtivo);
      } else {
        limparUnidadeAtivaId();
        setUnidadeAtivaId(null);
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível carregar o contexto de unidade.');
      setContexto(null);
      setUnidadeAtivaId(null);
      setVinculosUsuario([]);
    } finally {
      setCarregando(false);
    }
  }, [autenticado, usuario?.id]);

  useEffect(() => {
    void recarregarContexto();
  }, [recarregarContexto]);

  const definirUnidadeAtiva = useCallback(
    (id: number) => {
      if (!contexto?.unidadesDisponiveis.some((u) => u.id === id)) return;
      salvarUnidadeAtivaId(id);
      setUnidadeAtivaId(id);
    },
    [contexto],
  );

  const permissoesAtivas = useMemo(() => {
    const vinculo = vinculosUsuario.find((v) => v.idUnidadeEstoque === unidadeAtivaId);
    return permissoesDeVinculo(vinculo);
  }, [unidadeAtivaId, vinculosUsuario]);

  const valor = useMemo(
    () => ({
      carregando,
      erro,
      contexto,
      unidadeAtivaId,
      permissoesAtivas,
      vinculosUsuario,
      definirUnidadeAtiva,
      recarregarContexto,
    }),
    [
      carregando,
      erro,
      contexto,
      unidadeAtivaId,
      permissoesAtivas,
      vinculosUsuario,
      definirUnidadeAtiva,
      recarregarContexto,
    ],
  );

  return <ContextoUnidadeEstoque.Provider value={valor}>{children}</ContextoUnidadeEstoque.Provider>;
}

export function useUnidadeEstoque(): ContextoUnidadeEstoqueValor {
  const ctx = useContext(ContextoUnidadeEstoque);
  if (!ctx) throw new Error('useUnidadeEstoque deve ser usado dentro de ProvedorUnidadeEstoque.');
  return ctx;
}
