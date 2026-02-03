import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'vendor-react': ['react', 'react-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          // recharts is heavy - keep it separate and lazy-loaded with Analytics
          'vendor-recharts': ['recharts', 'd3-scale', 'd3-shape', 'd3-array', 'd3-interpolate'],
        },
      },
    },
  },
});
