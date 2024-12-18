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
        htmlFiles: ['src/popup/index.html', 'src/options/index.html'],
      }
    }),
  ],
  build: {
    sourcemap: true,
    rollupOptions: {
      input: {
        contentScript: path.resolve(__dirname, 'src/content/extractors/index.js'),
        background: path.resolve(__dirname, 'src/background/index.js'),
        popup: path.resolve(__dirname, 'src/popup/index.js'),
        options: path.resolve(__dirname, 'src/options/index.js')
      },
      output: [
        {
          format: 'es',
          entryFileNames: '[name].bundle.js',
          chunkFileNames: '[name].[hash].js',
          assetFileNames: 'assets/[name].[ext]',
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
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      { find: '@components', replacement: path.resolve(__dirname, 'src/components') },
      { find: '@utils', replacement: path.resolve(__dirname, 'src/utils') },
      { find: '@handlers', replacement: path.resolve(__dirname, 'src/handlers') },
      { find: '@styles', replacement: path.resolve(__dirname, 'src/styles') },
      { find: '@assets', replacement: path.resolve(__dirname, 'src/assets') }
    ]
  }
});