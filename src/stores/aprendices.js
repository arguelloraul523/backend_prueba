import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { aprendicesService } from "@/services/aprendices.service";

export const useAprendicesStore = defineStore("aprendices", () => {
  const items = ref([]);
  const loading = ref(false);
  const loaded = ref(false);
  // Sube cada vez que llegan datos nuevos; sirve para que otros componentes refresquen.
  const version = ref(0);

  const activos = computed(() => items.value.filter((a) => a.status === 0));

  /** Map(cursoId -> aprendices activos). El backend entrega el curso "poblado" (objeto). */
  const porCurso = computed(() => {
    const map = new Map();
    for (const a of activos.value) {
      const id = a.curso?._id;
      if (!id) continue;
      if (!map.has(id)) map.set(id, []);
      map.get(id).push(a);
    }
    return map;
  });

  async function fetch(force = false) {
    if (!force && (loaded.value || loading.value)) return;
    loading.value = true;
    try {
      const { data } = await aprendicesService.listar();
      items.value = data;
      loaded.value = true;
      version.value++;
    } finally {
      loading.value = false;
    }
  }

  async function guardar(id, payload) {
    const { data } = id ? await aprendicesService.actualizar(id, payload) : await aprendicesService.crear(payload);
    await fetch(true);
    return data.msg;
  }

  async function cambiarEstado(aprendiz) {
    const { data } = aprendiz.status === 0 ? await aprendicesService.desactivar(aprendiz._id) : await aprendicesService.activar(aprendiz._id);
    await fetch(true);
    return data.msg;
  }

  function reset() {
    items.value = [];
    loaded.value = false;
  }

  return { items, loading, loaded, version, activos, porCurso, fetch, guardar, cambiarEstado, reset };
});
