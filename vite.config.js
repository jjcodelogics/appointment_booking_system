import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // This will proxy API requests to your backend server running on port 3000
    proxy: {
      '/auth': 'http://localhost:3000',
      '/myappointments': 'http://localhost:3000',
      '/appointments': 'http://localhost:3000',
    },
  },
});