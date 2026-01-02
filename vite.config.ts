
import path from 'path';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    base: './',
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },

        // Fix dependencies error in dev
        dedupe: ["react", "react-dom", "react/jsx-runtime"],
    },
    server: {
        port: 3938,
        strictPort: true,
        host: true,
        allowedHosts: [
            "localhost",
            "127.0.0.1",
        ],
    },
})
