import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Chuyển mọi request /api/* sang backend Express => không cần cấu hình CORS
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});
