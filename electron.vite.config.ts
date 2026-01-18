import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@': resolve('src/renderer/src')
      }
    },
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Only include languages we actually use
            if (id.includes('monaco-editor')) {
              if (id.includes('/esm/vs/language/')) {
                const usedLanguages = [
                  'json', 'html', 'css', 'typescript', 'javascript',
                  'python', 'markdown', 'yaml', 'xml', 'shell'
                ]
                const isUsedLanguage = usedLanguages.some(lang => id.includes(`/language/${lang}/`))
                if (!isUsedLanguage) {
                  return 'monaco-unused'
                }
              }
            }
          }
        }
      }
    }
  }
})
