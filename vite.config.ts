import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'favicon-version',
      transformIndexHtml(html) {
        return html.replace('__FAVICON_VERSION__', pkg.version)
      },
    },
  ],
  // Use relative paths for custom domain compatibility
  // This allows the site to work at both github.io/repo and custom domain root
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
  test: {
    globals: false,
    environment: 'node',
    include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
  },
})
