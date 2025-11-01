import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Simplified Vite config for next-level Qivook
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      external: (id) => {
        // Exclude Rwanda HTML files from build
        if (id.includes('rwanda/raw_html_')) {
          return true;
        }
        return false;
      }
    }
  },
  server: {
    fs: {
      // Exclude Rwanda HTML files from dev server
      deny: ['**/rwanda/raw_html_*.html']
    }
  },
  define: {
    // Enable real data features
    __ENABLE_REAL_DATA__: JSON.stringify(process.env.VITE_ENABLE_REAL_DATA === 'true'),
    __ENABLE_ANALYTICS__: JSON.stringify(process.env.VITE_ENABLE_ANALYTICS === 'true'),
    __ENABLE_FINANCING__: JSON.stringify(process.env.VITE_ENABLE_FINANCING === 'true'),
  }
});

