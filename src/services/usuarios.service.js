import api from "./api";

// Espejo de las rutas de /api/usuarios (todas piden token, menos el login que está en auth.service).
export const usuariosService = {
  listar: (status) => api.get("/usuarios", { params: status === undefined ? {} : { status } }),
  crear: (data) => api.post("/usuarios/register", data),
  actualizar: (id, data) => api.put(`/usuarios/update/${id}`, data),
  activar: (id) => api.put(`/usuarios/active/${id}`),
  desactivar: (id) => api.put(`/usuarios/inactive/${id}`),
};
