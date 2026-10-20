import api from "./api";

export const authService = {
  login: (credenciales) => api.post("/usuarios/login", credenciales),
  registrar: (data) => api.post("/usuarios/register", data),
};
