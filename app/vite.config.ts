
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
            //'react-machine-package/types': '/home/monstermax/Dev/react_machine/package/dist/types.js',
            //'react-machine-package/core-components': '/home/monstermax/Dev/react_machine/package/dist/core-components.js',
            //'react-machine-package/api-components': '/home/monstermax/Dev/react_machine/package/dist/api-components.js',
            //'react-machine-package/devices-components': '/home/monstermax/Dev/react_machine/package/dist/devices-components.js',
            //'react-machine-package/devices-api': '/home/monstermax/Dev/react_machine/package/dist/devices-api.js',
        },

        preserveSymlinks: true,

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
