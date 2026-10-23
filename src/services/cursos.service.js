import api from "./api";

// Cada método es el espejo de una fila de la tabla de endpoints del README.
export const cursosService = {
  listar: (status) => api.get("/cursos", { params: status === undefined ? {} : { status } }),
  obtener: (id) => api.get(`/cursos/${id}`),
  crear: (data) => api.post("/cursos/register", data),
  actualizar: (id, data) => api.put(`/cursos/update/${id}`, data),
  activar: (id) => api.put(`/cursos/active/${id}`),
  desactivar: (id) => api.put(`/cursos/inactive/${id}`),
};
