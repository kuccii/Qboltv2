import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': process.env,
  },
  optimizeDeps: {
    include: ['lucide-react'],
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
  }
});
