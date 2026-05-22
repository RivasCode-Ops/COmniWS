import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        external: ['better-sqlite3']
      }
    },
    resolve: {
      alias: {
        '@': resolve('src')
      }
    }
  },
  preload: {
    resolve: {
      alias: {
        '@': resolve('src')
      }
    }
  },
  renderer: {
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve('src')
      }
    }
  }
})
