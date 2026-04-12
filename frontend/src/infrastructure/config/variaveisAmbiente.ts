/**
 * URL base da API.
 * - Em desenvolvimento, se `VITE_URL_BASE_API` estiver vazio/ausente, usa string vazia para
 *   requisições relativas (`/api/...`) e o proxy do Vite encaminha ao backend.
 * - Em produção, defina `VITE_URL_BASE_API` com a URL pública da API (ex.: https://api.seudominio.com).
 */
function resolverUrlBaseApi(): string {
  const bruto = import.meta.env.VITE_URL_BASE_API;
  if (bruto !== undefined && bruto !== null && String(bruto).trim() !== '') {
    return String(bruto).replace(/\/$/, '');
  }
  if (import.meta.env.DEV) {
    return '';
  }
  return 'http://localhost:5000';
}

export const urlBaseApi = resolverUrlBaseApi();
