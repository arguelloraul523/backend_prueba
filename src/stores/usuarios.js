import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { usuariosService } from "@/services/usuarios.service";

// Historial de accesos (cuentas que pueden iniciar sesión).
export const useUsuariosStore = defineStore("usuarios", () => {
  const items = ref([]);
  const loading = ref(false);
  const loaded = ref(false);
  // El backend original solo tiene login y register. Si no expone el listado, el historial
  // se arma con las cuentas creadas desde este navegador (guardadas con pinia-plugin-persistedstate).
  const modoLocal = ref(false);
  const historial = ref([]);

  const activos = computed(() => items.value.filter((u) => u.status === 0));

  async function fetch(force = false) {
    if (!force && (loaded.value || loading.value)) return;
    loading.value = true;
    try {
      const { data } = await usuariosService.listar();
      items.value = data;
      modoLocal.value = false;
      loaded.value = true;
    } catch (e) {
      if (e.response?.status !== 404) throw e;
      modoLocal.value = true;
      items.value = [...historial.value];
      loaded.value = true;
    } finally {
      loading.value = false;
    }
  }

  /** Crea (sin id) o actualiza (con id). Devuelve el mensaje del backend. */
  async function guardar(id, payload) {
    const { data } = id ? await usuariosService.actualizar(id, payload) : await usuariosService.crear(payload);
    if (!id && modoLocal.value) recordar({ nombre: payload.nombre, email: payload.email, rol: "USER" });
    await fetch(true);
    return data.msg;
  }

  async function cambiarEstado(usuario) {
    const { data } = usuario.status === 0 ? await usuariosService.desactivar(usuario._id) : await usuariosService.activar(usuario._id);
    await fetch(true);
    return data.msg;
  }

  /** Anota una cuenta en el historial local (solo en modo local). */
  function recordar(u) {
    const email = String(u.email || "").trim().toLowerCase();
    if (!email || historial.value.some((x) => x.email === email)) return;
    historial.value.unshift({
      _id: u._id || "local-" + email,
      nombre: String(u.nombre || "").trim().toUpperCase(),
      email,
      rol: u.rol || "USER",
      status: 0,
      createdAt: u.createdAt || new Date().toISOString(),
    });
    if (modoLocal.value) items.value = [...historial.value];
  }

  function reset() {
    items.value = [];
    loaded.value = false;
  }

  return { items, loading, loaded, modoLocal, historial, activos, fetch, guardar, cambiarEstado, recordar, reset };
}, { persist: { key: "cat.accesos", pick: ["historial"] } });
