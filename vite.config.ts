import { defineConfig } from 'vite';

export default defineConfig({
  base: '/pentatonic-pro/',
  define: {
    // This allows process.env.API_KEY to be replaced with the actual env var during build
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    'process.env.OPENROUTER_API_KEY': JSON.stringify(process.env.OPENROUTER_API_KEY),
    'process.env.OPENROUTER_MODEL': JSON.stringify(process.env.OPENROUTER_MODEL),
  },
  build: {
    outDir: 'dist',
    target: 'esnext'
  },
  server: {
    port: 3000
  }
});