import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      network: resolve(__dirname, './src/network'),
      components: resolve(__dirname, './src/components'),
      containers: resolve(__dirname, './src/containers'),
      hooks: resolve(__dirname, './src/hooks'),
      navigation: resolve(__dirname, './src/generated/navigation'),
      env: resolve(__dirname, './src/env'),
    },
  },
  build: {
    // we want very fast builds with very fast loading times on average, even if it means a longer first page loading time and browser restrictions.
    target: 'esnext',
    // we don't use lots of static images, but when we do, more likely than not, we reuse them, which makes inlining a bad idea.
    assetsInlineLimit: 0,
  }
})
