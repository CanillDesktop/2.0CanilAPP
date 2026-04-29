/** Formato comum de erro retornado pela API (classe ErrorResponse no backend). */
export type RespostaErroApi = {
  statusCode: number;
  details: string;
  title: string;
};

/** Formato de erro retornado pela API quando existem erros de ModelValidation. */
export type RespostaErroValidacaoApi = {
  statusCode: number;
  title: string;
  errors: Record<string, string[]>;
  traceId: string;
}

export function isRespostaErroApi(obj: NonNullable<unknown>): obj is RespostaErroApi {
  return typeof obj === 'object' && 'details' in obj;
}

export function isRespostaErroValidacaoApi(obj: NonNullable<unknown>): obj is RespostaErroValidacaoApi {
  return typeof obj === 'object' && 'errors' in obj;
}
