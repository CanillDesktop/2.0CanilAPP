import { useCallback, useEffect, useMemo, useState } from 'react';
import { extrairMensagemErroApi } from '../../../infrastructure/http/erroApi';
import { listarUnidadesMedidaApi } from '../api/unidadesMedidaApi';
import type { TipoItemUnidadeMedida, UnidadeMedidaDto } from '../types/tiposUnidadeMedida';
import { rotuloUnidadeMedida } from '../types/tiposUnidadeMedida';

/** Carrega unidades de medida aplicáveis a um tipo de item (cadastro/filtros). */
export function useUnidadesMedida(aplicavelA?: TipoItemUnidadeMedida, apenasAtivas = true) {
  const [itens, setItens] = useState<UnidadeMedidaDto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const lista = await listarUnidadesMedidaApi({ aplicavelA, apenasAtivas });
      setItens(lista);
    } catch (e) {
      setErro(extrairMensagemErroApi(e));
      setItens([]);
    } finally {
      setCarregando(false);
    }
  }, [aplicavelA, apenasAtivas]);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  const porId = useMemo(() => {
    const mapa = new Map<number, UnidadeMedidaDto>();
    for (const item of itens) mapa.set(item.id, item);
    return mapa;
  }, [itens]);

  const rotuloPorId = useCallback(
    (id: number | null | undefined) => {
      if (id == null) return '—';
      const item = porId.get(id);
      return item ? rotuloUnidadeMedida(item) : `Unidade ${id}`;
    },
    [porId],
  );

  return { itens, carregando, erro, recarregar, rotuloPorId };
}
