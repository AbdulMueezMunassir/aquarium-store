import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    disabled: true,
  },
  server: {
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
});
