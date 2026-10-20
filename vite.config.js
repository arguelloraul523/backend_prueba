import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { quasar, transformAssetUrls } from "@quasar/vite-plugin";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [
    vue({ template: { transformAssetUrls } }),
    // Quasar como plugin de Vite: solo se empaquetan los componentes que se usan.
    quasar({
      sassVariables: fileURLToPath(new URL("./src/css/quasar.variables.scss", import.meta.url)),
    }),
  ],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  // 5173 es el puerto que el backend espera en URL_FRONTEND (.env.example).
  server: { port: 5173 },
  build: { chunkSizeWarningLimit: 900 },
});
