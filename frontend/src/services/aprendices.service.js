import api from "./api";

export const aprendicesService = {
  listar: (status) => api.get("/aprendices", { params: status === undefined ? {} : { status } }),
  obtener: (id) => api.get(`/aprendices/${id}`),
  porCurso: (cursoId) => api.get(`/aprendices/curso/${cursoId}`),
  crear: (data) => api.post("/aprendices/register", data),
  actualizar: (id, data) => api.put(`/aprendices/update/${id}`, data),
  activar: (id) => api.put(`/aprendices/active/${id}`),
  desactivar: (id) => api.put(`/aprendices/inactive/${id}`),
};
