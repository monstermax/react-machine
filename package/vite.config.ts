import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import { viteStaticCopy } from "vite-plugin-static-copy";
import tailwindcss from '@tailwindcss/vite'

//import { asmDirectoryPlugin } from './src/v2/lib/vite_asm_index'


export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    //asmDirectoryPlugin(), // A revoir
    dts({
      tsconfigPath: './tsconfig.json',
      rollupTypes: true,
      insertTypesEntry: true,
    }),
    viteStaticCopy({
      targets: [
        {
          src: "resources/**/*",
          dest: "resources",
        },
      ],
    }),
  ],
  build: {
    sourcemap: true,
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        types: resolve(__dirname, 'src/types/index.ts'),
        'core-components': resolve(__dirname, 'src/core/components/index.ts'),
        'core-api': resolve(__dirname, 'src/core/api/index.ts'),
        'devices-components': resolve(__dirname, 'src/devices/components/index.ts'),
        'devices-api': resolve(__dirname, 'src/devices/api/index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'react-dom/client',
      ],
      output: {
        entryFileNames: '[name].js',
      },
    },
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
    preserveSymlinks: false,
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
});
