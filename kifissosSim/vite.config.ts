import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    host: true, // Allow mobile testing on local network
  },
  build: {
    target: 'es2022',
    sourcemap: true,
  },
});
