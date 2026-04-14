import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// Interceptor de respuesta: loguea errores centralmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[API Error]", error.response?.data ?? error.message);
    return Promise.reject(error);
  },
);

export default api;
