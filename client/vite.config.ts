import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vanillaExtractPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5183,
    /* API 는 옆 패키지가 받는다. 프록시로 붙여야 쿠키가 같은 출처로
       오가고 CORS 설정이 통째로 필요 없어진다. */
    proxy: {
      '/api': { target: 'http://localhost:5184' },
    },
  },
});
