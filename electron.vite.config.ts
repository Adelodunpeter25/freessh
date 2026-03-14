import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

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
    plugins: [react(), svgr()],
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('monaco-editor')) {
              const usedVsLanguage = ['json', 'html', 'css', 'typescript']
              const usedBasicLanguages = ['xml', 'python', 'markdown', 'shell', 'dockerfile', 'ini']

              if (id.includes('/esm/vs/language/')) {
                const keep = usedVsLanguage.some((lang) => id.includes(`/language/${lang}/`))
                if (!keep) return 'monaco-unused'
              }

              if (id.includes('/esm/vs/basic-languages/')) {
                const keep = usedBasicLanguages.some((lang) => id.includes(`/basic-languages/${lang}/`))
                if (!keep) return 'monaco-unused'
              }
            }
          }
        }
      }
    }
  }
})
