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
  const usuarioForm = reactive({ open: false, item: null });

  const openCurso = (item = null) => Object.assign(cursoForm, { open: true, item });
  const openAprendiz = (item = null, cursoId = "") => Object.assign(aprendizForm, { open: true, item, cursoId });
  const openRoster = (curso) => Object.assign(roster, { open: true, curso });
  const openUsuario = (item = null) => Object.assign(usuarioForm, { open: true, item });

  return { cursoForm, aprendizForm, roster, usuarioForm, openCurso, openAprendiz, openRoster, openUsuario };
});
