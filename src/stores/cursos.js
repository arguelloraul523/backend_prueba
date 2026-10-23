import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { cursosService } from "@/services/cursos.service";

export const useCursosStore = defineStore("cursos", () => {
  const items = ref([]);
  const loading = ref(false);
  const loaded = ref(false);

  const activos = computed(() => items.value.filter((c) => c.status === 0));
  const byId = computed(() => new Map(items.value.map((c) => [c._id, c])));
  const maxHoras = computed(() => Math.max(1, ...items.value.map((c) => c.duracion || 0)));

  async function fetch(force = false) {
    if (!force && (loaded.value || loading.value)) return;
    loading.value = true;
    try {
      const { data } = await cursosService.listar();
      items.value = data;
      loaded.value = true;
    } finally {
      loading.value = false;
    }
  }

  /** Crea (sin id) o actualiza (con id). Devuelve el mensaje del backend. */
  async function guardar(id, payload) {
    const { data } = id ? await cursosService.actualizar(id, payload) : await cursosService.crear(payload);
    await fetch(true);
    return data.msg;
  }

  async function cambiarEstado(curso) {
    const { data } = curso.status === 0 ? await cursosService.desactivar(curso._id) : await cursosService.activar(curso._id);
    await fetch(true);
    return data.msg;
  }

  function reset() {
    items.value = [];
    loaded.value = false;
  }

  return { items, loading, loaded, activos, byId, maxHoras, fetch, guardar, cambiarEstado, reset };
});
