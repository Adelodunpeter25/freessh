// electron.vite.config.ts
import { resolve } from "path";
import { defineConfig } from "electron-vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
var electron_vite_config_default = defineConfig({
  main: {},
  preload: {},
  renderer: {
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/src"),
        "@": resolve("src/renderer/src")
      }
    },
    plugins: [react(), svgr()],
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes("monaco-editor")) {
              if (id.includes("/esm/vs/language/")) {
                const usedLanguages = [
                  "json",
                  "html",
                  "css",
                  "typescript",
                  "javascript",
                  "python",
                  "markdown",
                  "yaml",
                  "xml",
                  "shell"
                ];
                const isUsedLanguage = usedLanguages.some((lang) => id.includes(`/language/${lang}/`));
                if (!isUsedLanguage) {
                  return "monaco-unused";
                }
              }
            }
          }
        }
      }
    }
  }
});
export {
  electron_vite_config_default as default
};
