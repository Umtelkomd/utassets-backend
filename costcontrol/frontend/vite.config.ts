import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: '/costcontrol/',
    server: {
        port: 3000,
        open: true,
        proxy: {
            '/api': {
                target: 'https://costcontrol-backend.onrender.com/api',
                changeOrigin: true,
            },
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
    },
    resolve: {
        alias: {
            '@': '/src',
        },
    },
}) 