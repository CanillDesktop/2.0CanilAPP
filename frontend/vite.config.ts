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
      // IPv4 explícito: no Windows "localhost" pode ir para ::1 e o Firefox não conecta se o servidor só escutar em 127.0.0.1.
      host: '127.0.0.1',
      // Alinha com .vscode/launch.json. Se a porta estiver ocupada, o Vite encerra com erro.
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: alvoApiDev,
          changeOrigin: true,
        },
      },
    },
  };
});
