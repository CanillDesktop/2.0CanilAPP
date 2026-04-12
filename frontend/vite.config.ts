import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  /** Destino da API no desenvolvimento (proxy evita CORS no browser). */
  const alvoApiDev = env.VITE_DEV_API_PROXY_TARGET || 'http://localhost:5000';

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: alvoApiDev,
          changeOrigin: true,
        },
      },
    },
  };
});
