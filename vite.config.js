import { defineConfig } from 'vite';

// base relativa para poder abrir el build desde cualquier carpeta
export default defineConfig({
  base: './',
  server: { port: 5173, open: true },
  build: { outDir: 'dist', assetsInlineLimit: 0 }
});
