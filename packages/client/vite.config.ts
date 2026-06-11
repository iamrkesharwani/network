import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (
            id.includes('react/') ||
            id.includes('react-dom') ||
            id.includes('react-router-dom')
          ) {
            return 'vendor';
          }
          if (id.includes('@reduxjs/toolkit') || id.includes('react-redux')) {
            return 'state';
          }
          if (id.includes('i18next')) {
            return 'i18n';
          }
          if (id.includes('framer-motion')) {
            return 'motion';
          }
          if (id.includes('hls.js')) {
            return 'media';
          }
          if (
            id.includes('lucide-react') ||
            id.includes('clsx') ||
            id.includes('tailwind-merge')
          ) {
            return 'ui';
          }
        },
      },
    },
  },
});
