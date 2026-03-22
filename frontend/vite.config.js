<<<<<<< HEAD
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        host: '0.0.0.0',
        proxy: {
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true,
                secure: false,
            },
            '/ws': {
                target: 'ws://localhost:3001',
                ws: true,
                changeOrigin: true,
            },
            '/acs-audio': {
                target: 'ws://localhost:3001',
                ws: true,
                changeOrigin: true,
            },
        },
    },
});
=======
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true,
            },
            '/ws': {
                target: 'ws://localhost:3001',
                ws: true,
            },
        },
    },
});
>>>>>>> pr-3
