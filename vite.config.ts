import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isProduction = mode === 'production';
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      // Remove console logs and debugger statements in production
      esbuild: {
        drop: isProduction ? ['console', 'debugger'] : []
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              // Vendor chunk for large libraries
              vendor: ['react', 'react-dom', 'react-router-dom'],
              // UI chunk for component libraries
              ui: ['@stripe/react-stripe-js', '@stripe/stripe-js'],
              // Charts chunk for data visualization
              charts: ['recharts', 'd3', 'mermaid'],
              // Utils chunk for utilities
              utils: ['axios', 'dayjs']
            }
          }
        },
        // Enable source maps only in development
        sourcemap: !isProduction,
        // Optimize chunk size
        chunkSizeWarningLimit: 1000,
        // Minify in production
        minify: isProduction ? 'esbuild' : false
      }
    };
});
