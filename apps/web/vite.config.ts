import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    open: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2022',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        /**
         * Manual chunks keep the initial download lean by splitting heavy,
         * stable third-party libraries into their own files. Browsers cache
         * each chunk independently, so a hotfix to the app code doesn't
         * invalidate React or Redux.
         */
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Order matters: specific paths first so react-router-dom isn't
            // accidentally matched by a generic "react-dom" substring check.
            if (id.includes('react-router')) return 'vendor-router';
            if (id.includes('@reduxjs') || id.includes('react-redux') || id.includes('reselect')) {
              return 'vendor-redux';
            }
            if (id.includes('@radix-ui')) return 'vendor-radix';
            if (id.includes('@visx') || id.includes('d3-')) return 'vendor-visx';
            if (id.includes('i18next')) return 'vendor-i18n';
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
              return 'vendor-forms';
            }
            if (id.includes('msw')) return 'vendor-msw';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('/react-dom/') || id.includes('/react/')) return 'vendor-react';
          }
          return undefined;
        },
      },
    },
  },
});
