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
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (/[\\/](recharts|d3-[^\\/]+|react-is|react-smooth|recharts-scale)[\\/]/.test(id)) return 'charts';
          if (id.includes('node_modules/leaflet')) return 'maps';
          if (id.includes('node_modules/axios')) return 'http';
          if (id.includes('node_modules/react-router')) return 'router';
          if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) return 'react-vendor';
          return 'vendor';
        },
      },
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