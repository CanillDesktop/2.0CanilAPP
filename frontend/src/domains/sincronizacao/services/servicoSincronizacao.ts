import { solicitarLimpezaSyncApi, solicitarSincronizacaoApi } from '../api/sincronizacaoApi';

export const servicoSincronizacao = {
  sincronizar() {
    return solicitarSincronizacaoApi();
  },
  limpar() {
    return solicitarLimpezaSyncApi();
  },
};
