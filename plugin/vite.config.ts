// vite.config.js
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src', 'main.ts'),
      name: 'payload-plugin-translator',
    },
  },
});
