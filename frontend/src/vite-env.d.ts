/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_URL_BASE_API?: string;
  /** Destino do proxy Vite para `/api` em desenvolvimento (ver vite.config.ts). */
  readonly VITE_DEV_API_PROXY_TARGET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
