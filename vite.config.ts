import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  return {
    base: '/pentatonic-pro/',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    // Security: Removed API key injection to prevent exposure in production builds
    // The Gemini API integration is disabled for public deployments
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
