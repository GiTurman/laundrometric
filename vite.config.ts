import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  // 1. ვზრდით ლიმიტს, რომ გაფრთხილება გაქრეს
  build: {
    chunkSizeWarningLimit: 2000, 
    rollupOptions: {
      input: './index.html',
    }
  },
  // 2. ვამატებთ CSS-ის მხარდაჭერას
  css: {
    postcss: './postcss.config.js'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
