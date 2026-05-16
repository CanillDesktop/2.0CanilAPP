import { useCallback, useRef, useState } from 'react';
import { extrairMensagemErroApi } from '../../../infrastructure/http/erroApi';
import { servicoEstoque } from '../services/servicoEstoque';
import type {
  RetiradaHistoricoFiltroDto,
  RetiradaHistoricoListaPaginadaDto,
  RetiradaPaginacaoDto,
} from '../types/tiposEstoque';

export function useHistoricoRetiradasPaginado() {
  const [estado, setEstado] = useState<{
    dados: RetiradaHistoricoListaPaginadaDto | null;
    carregando: boolean;
    erro: string | null;
  }>({ dados: null, carregando: false, erro: null });
  const seqRef = useRef(0);

  const carregar = useCallback(async (filtro: RetiradaHistoricoFiltroDto, paginacao?: RetiradaPaginacaoDto) => {
    const id = ++seqRef.current;
    setEstado((s) => ({ ...s, carregando: true, erro: null }));
    try {
      const dados = await servicoEstoque.consultarHistoricoRetiradas(filtro, paginacao);
      if (id !== seqRef.current) return null;
      setEstado({ dados, carregando: false, erro: null });
      return dados;
    } catch (e) {
      if (id !== seqRef.current) return null;
      const mensagem = extrairMensagemErroApi(e);
      setEstado((s) => ({ ...s, carregando: false, erro: mensagem }));
      return null;
    }
  }, []);

  return { estado, carregar };
}
