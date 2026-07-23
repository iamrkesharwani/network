import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      '@network/shared': path.resolve(__dirname, '../shared/src'),
    },
  },
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
