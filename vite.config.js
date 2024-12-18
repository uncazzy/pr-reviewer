import { defineConfig } from 'vite';
import webExtension from 'vite-plugin-web-extension';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    webExtension({
      manifest: './manifest.json',
      browser: 'chrome',
      webExtConfig: {
        buildDirectory: 'dist',
        htmlFiles: ['popup.html', 'options.html'],
      }
    }),
  ],
  build: {
    sourcemap: true,
    rollupOptions: {
      input: {
        contentScript: path.resolve(__dirname, 'contentScript.js'),
        background: path.resolve(__dirname, 'background.js'),
        popup: path.resolve(__dirname, 'popup.js'),
        options: path.resolve(__dirname, 'options.js')
      },
      output: [
        {
          format: 'es',
          entryFileNames: '[name].bundle.js',
          chunkFileNames: '[name].[hash].js',
          assetFileNames: '[name].[ext]',
          dir: 'dist'
        }
      ]
    },
    outDir: 'dist',
    emptyOutDir: true,
    modulePreload: false,
    cssCodeSplit: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './modules'),
    },
  },
});