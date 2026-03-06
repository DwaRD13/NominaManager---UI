import api from './api.js'

// Base: /v1/tipos-ingresos — igual que el backend
const ENDPOINT = '/v1/tipos-ingresos'

export const tiposIngresosService = {
  /** @returns {Promise<import('../types').TipoIngreso[]>} */
  getAll: () => api.get(ENDPOINT).then((r) => r.data),

  /** @param {number} id @returns {Promise<import('../types').TipoIngreso>} */
  getById: (id) => api.get(`${ENDPOINT}/id/${id}`).then((r) => r.data),

  /** @param {string} nombre @returns {Promise<import('../types').TipoIngreso>} */
  getByNombre: (nombre) => api.get(`${ENDPOINT}/nombre/${nombre}`).then((r) => r.data),

  /**
   * @param {import('../types').TipoIngresoPayload} data
   * @returns {Promise<import('../types').TipoIngreso>}
   */
  create: (data) => api.post(ENDPOINT, data).then((r) => r.data),

  /**
   * El backend espera el id dentro del body (PUT /v1/tipos-ingresos/actualizar)
   * @param {import('../types').TipoIngresoPayload & { id: number }} data
   * @returns {Promise<import('../types').TipoIngreso>}
   */
  update: (data) => api.put(`${ENDPOINT}/actualizar`, data).then((r) => r.data),

  /**
   * El backend usa PUT para eliminación lógica (PUT /v1/tipos-ingresos/eliminar/{id})
   * @param {number} id
   * @returns {Promise<string>}
   */
  remove: (id) => api.put(`${ENDPOINT}/eliminar/${id}`).then((r) => r.data),
}
