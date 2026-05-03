import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/pokemon-type-coverage-tool/',
  plugins: [react()],
});
