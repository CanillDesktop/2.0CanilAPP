/** Formato comum de erro retornado pela API (classe ErrorResponse no backend). */
export type RespostaErroApi = {
  statusCode: number;
  details: string;
  title: string;
};