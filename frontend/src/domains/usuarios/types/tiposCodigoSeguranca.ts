/** Código de segurança global do sistema (integração futura com o backend). */
export type CodigoSegurancaDto = {
  codigo: string;
  atualizadoEm?: string | null;
};

export type AtualizarCodigoSegurancaDto = {
  codigo: string;
};
