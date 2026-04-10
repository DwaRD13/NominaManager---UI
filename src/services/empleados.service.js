import api from "./api.js";

// Base: /v1/empleado  (singular — así está definido en el backend)
const ENDPOINT = "/v1/empleado";

export const empleadosService = {
  /** @returns {Promise<import('../types').Empleado[]>} */
  getAll: () => api.get(ENDPOINT).then((r) => r.data),

  /** @returns {Promise<import('../types').Empleado[]>} */
  getAllLessTodos: () => api.get(`${ENDPOINT}/less_todos`).then((r) => r.data),

  /** @param {number} id @returns {Promise<import('../types').Empleado>} */
  getById: (id) => api.get(`${ENDPOINT}/id/${id}`).then((r) => r.data),

  /** @param {string} nombre @returns {Promise<import('../types').Empleado>} */
  getByNombre: (nombre) =>
    api.get(`${ENDPOINT}/nombre/${nombre}`).then((r) => r.data),

  /**
   * @param {import('../types').EmpleadoPayload} data
   * @returns {Promise<import('../types').Empleado>}
   */
  create: (data) => api.post(ENDPOINT, data).then((r) => r.data),

  /**
   * El backend espera el id dentro del body (PUT /v1/empleado/actualizar)
   * @param {import('../types').EmpleadoPayload & { id: number }} data
   * @returns {Promise<import('../types').Empleado>}
   */
  update: (data) => api.put(`${ENDPOINT}/actualizar`, data).then((r) => r.data),

  /**
   * El backend usa PUT para eliminación lógica (PUT /v1/empleado/eliminar/{id})
   * @param {number} id
   * @returns {Promise<string>}
   */
  remove: (id) => api.put(`${ENDPOINT}/eliminar/${id}`).then((r) => r.data),
};
