import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { authService } from "@/services/auth.service";
import { useCursosStore } from "./cursos";
import { useAprendicesStore } from "./aprendices";

export const useAuthStore = defineStore(
  "auth",
  () => {
    const token = ref("");
    const usuario = ref(null);

    const isAuth = computed(() => !!token.value);
    const primerNombre = computed(() => (usuario.value?.nombre || "").split(" ")[0]);

    async function login(credenciales) {
      const { data } = await authService.login(credenciales);
      token.value = data.token;
      usuario.value = data.usuario;
    }

    function logout() {
      token.value = "";
      usuario.value = null;
      useCursosStore().reset();
      useAprendicesStore().reset();
    }

    return { token, usuario, isAuth, primerNombre, login, logout };
  },
  // pinia-plugin-persistedstate: el token sobrevive a recargar la página.
  { persist: { key: "cat.auth", pick: ["token", "usuario"] } }
);
