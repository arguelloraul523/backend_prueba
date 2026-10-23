// Utilidades de presentación (no hablan con la API).

const HUES = [14, 34, 154, 178, 204, 232, 266, 322];

/** Tono estable por texto: el mismo curso siempre tiene el mismo color. */
export function hueOf(text = "") {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return HUES[h % HUES.length];
}

/** "ANA MARIA GOMEZ" -> "Ana Maria Gomez" */
export function titleCase(text = "") {
  return text.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());
}

/** "ANALISIS Y DESARROLLO" -> "Analisis y desarrollo" */
export function sentenceCase(text = "") {
  const t = text.toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "·";
}

/** Minúsculas y sin tildes, para buscar sin que importen los acentos. */
export function norm(text = "") {
  return String(text).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export const fmtNumber = (n) => Number(n || 0).toLocaleString("es-CO");

export function fmtDate(date = new Date()) {
  return new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(date);
}

export function fmtShortDate(value) {
  return new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

export function relativeTime(value) {
  const diff = (new Date(value).getTime() - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
  const steps = [["year", 31536000], ["month", 2592000], ["day", 86400], ["hour", 3600], ["minute", 60]];
  for (const [unit, secs] of steps) {
    if (Math.abs(diff) >= secs) return rtf.format(Math.round(diff / secs), unit);
  }
  return "ahora mismo";
}

export function saludo() {
  const h = new Date().getHours();
  return h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";
}

/**
 * Convierte un error de axios en una lista de mensajes legibles.
 * El backend responde 400 con { msg, errors: [...] } cuando falla la validación.
 */
export function apiErrors(error) {
  const data = error?.response?.data;
  if (Array.isArray(data?.errors) && data.errors.length) return data.errors;
  if (data?.msg) return [data.msg];
  if (error?.code === "ECONNABORTED") return ["El servidor tardó demasiado en responder"];
  if (!error?.response) return ["No hay conexión con el servidor. ¿Está corriendo el backend?"];
  return ["No fue posible terminar la operación"];
}
