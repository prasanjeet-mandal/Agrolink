import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.trycloudflare.com',
      '.ngrok-free.app',
      '.ngrok.app',
      '29f5-2409-40d2-300d-7534-5974-3aba-7873-3d40.ngrok-free.app',
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/optimize': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
    },
  },
});