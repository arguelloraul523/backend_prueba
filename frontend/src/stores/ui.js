import { defineStore } from "pinia";
import { ref } from "vue";

const prefiereOscuro = () => typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches;

// Preferencias de interfaz: se recuerdan entre visitas (pinia-plugin-persistedstate).
export const useUiStore = defineStore(
  "ui",
  () => {
    const theme = ref(prefiereOscuro() ? "dark" : "light");
    const cursosLayout = ref("fichas"); // "fichas" | "lista"
    const aprendicesLayout = ref("carnets"); // "carnets" | "tabla"

    const toggleTheme = () => (theme.value = theme.value === "dark" ? "light" : "dark");

    return { theme, cursosLayout, aprendicesLayout, toggleTheme };
  },
  { persist: { key: "cat.ui", pick: ["theme", "cursosLayout", "aprendicesLayout"] } }
);
