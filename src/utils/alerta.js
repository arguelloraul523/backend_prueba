import Swal from "sweetalert2";
import { apiErrors } from "./format";

/**
 * TODA la comunicación con la persona (validaciones, errores, confirmaciones y
 * éxitos) pasa por SweetAlert2. No se usan validaciones HTML (required, type=email,
 * pattern...), ni <form>, ni alert()/confirm() del navegador.
 */
const base = Swal.mixin({
  buttonsStyling: false,
  reverseButtons: true,
  returnFocus: false,
  customClass: {
    popup: "swal-c",
    title: "swal-c__title",
    htmlContainer: "swal-c__body",
    actions: "swal-c__actions",
    confirmButton: "swal-c__btn swal-c__btn--solid",
    cancelButton: "swal-c__btn swal-c__btn--ghost",
  },
});

const toast = Swal.mixin({
  toast: true,
  position: "bottom-end",
  width: "auto",
  grow: false,
  heightAuto: false,
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  customClass: { popup: "swal-t" },
});

const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Texto o arreglo de textos -> HTML seguro para el cuerpo del aviso. */
function cuerpo(detalle) {
  if (Array.isArray(detalle)) return `<ul class="swal-lista">${detalle.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>`;
  return esc(detalle || "");
}

export const alerta = {
  /** Validación del formulario: recibe la lista de problemas encontrados. */
  aviso: (titulo, detalle) => base.fire({ icon: "warning", title: titulo, html: cuerpo(detalle), confirmButtonText: "Entendido" }),

  error: (titulo, detalle) => base.fire({ icon: "error", title: titulo, html: cuerpo(detalle), confirmButtonText: "Cerrar" }),

  /** Éxito rápido que no interrumpe. */
  ok: (texto) => toast.fire({ icon: "success", title: texto }),

  /** Devuelve true si la persona confirma. */
  async confirmar({ titulo, texto, boton = "Confirmar", peligro = false }) {
    const r = await base.fire({
      icon: peligro ? "warning" : "question",
      title: titulo,
      html: cuerpo(texto),
      showCancelButton: true,
      confirmButtonText: boton,
      cancelButtonText: "Cancelar",
      customClass: {
        popup: "swal-c",
        title: "swal-c__title",
        htmlContainer: "swal-c__body",
        actions: "swal-c__actions",
        confirmButton: `swal-c__btn ${peligro ? "swal-c__btn--danger" : "swal-c__btn--solid"}`,
        cancelButton: "swal-c__btn swal-c__btn--ghost",
      },
    });
    return r.isConfirmed;
  },

  /** Errores que devuelve el backend: { msg, errors: [...] } (400) u otros. */
  errorApi(e, titulo = "No se pudo completar la acción") {
    if (!e?.response) return this.error("Sin conexión con el servidor", apiErrors(e));
    return this.error(titulo, apiErrors(e));
  },
};

/** Valida con una lista de reglas [condiciónQueFalla, mensaje]; devuelve los mensajes. */
export const problemas = (reglas) => reglas.filter(([falla]) => falla).map(([, mensaje]) => mensaje);

export const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
