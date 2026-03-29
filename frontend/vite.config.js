import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5174,
        host: '0.0.0.0',
        strictPort: true,
        allowedHosts: true, // For Vite 6 compatibility
        hmr: {
            clientPort: 443 // Essential for tunnel HMR
        },
        proxy: {
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true,
                secure: false,
            },
            '/ws': {
                target: 'ws://127.0.0.1:3001',
                ws: true,
                changeOrigin: true,
            },
            '/acs-audio': {
                target: 'ws://127.0.0.1:3001',
                ws: true,
                changeOrigin: true,
                rewrite: function (path) { return path.replace(/^\/acs-audio/, '/acs-audio'); }
            },
        },
    },
});
