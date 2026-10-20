import axios from "axios";

// Instancia ÚNICA de axios: si cambia la URL del backend se cambia en un solo lugar (.env).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

/**
 * Se llama una vez desde main.js. Recibe funciones en vez de importar el store
 * o el router aquí, para evitar dependencias circulares
 * (router -> store -> servicio -> api -> router).
 */
export function setupInterceptors({ getToken, onUnauthorized }) {
  // Toda petición sale con el token en la cabecera x-token (lo que exige validateJWT).
  api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers["x-token"] = token;
    return config;
  });

  // 401 = "no sé quién eres" -> se cierra la sesión y se manda al login.
  // (El login fallido responde 400, por eso no cae aquí.)
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) onUnauthorized(error.response.data?.msg);
      return Promise.reject(error);
    }
  );
}

export default api;
