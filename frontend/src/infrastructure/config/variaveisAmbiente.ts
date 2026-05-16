function resolverUrlBaseApi(): string {
  const bruto = import.meta.env.VITE_URL_BASE_API;

  if (bruto !== undefined && bruto !== null && String(bruto).trim() !== '') {
    return String(bruto).replace(/\/$/, '');
  }

  if (import.meta.env.DEV) {
    return '';
  }

  throw new Error('VITE_URL_BASE_API não definido em produção');
}

export const urlBaseApi = resolverUrlBaseApi();