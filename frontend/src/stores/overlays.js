import { defineStore } from "pinia";
import { reactive } from "vue";

/**
 * Estado de los paneles laterales (formularios y nómina). Vive en un store para que
 * cualquier vista pueda abrirlos sin pasarse props de un lado a otro.
 */
export const useOverlaysStore = defineStore("overlays", () => {
  const cursoForm = reactive({ open: false, item: null });
  const aprendizForm = reactive({ open: false, item: null, cursoId: "" });
  const roster = reactive({ open: false, curso: null });

  const openCurso = (item = null) => Object.assign(cursoForm, { open: true, item });
  const openAprendiz = (item = null, cursoId = "") => Object.assign(aprendizForm, { open: true, item, cursoId });
  const openRoster = (curso) => Object.assign(roster, { open: true, curso });

  return { cursoForm, aprendizForm, roster, openCurso, openAprendiz, openRoster };
});
