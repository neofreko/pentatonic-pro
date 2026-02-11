import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    // This allows process.env.API_KEY to be replaced with the actual env var during build
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  },
  build: {
    outDir: 'dist',
    target: 'esnext'
  },
  server: {
    port: 3000
  }
});