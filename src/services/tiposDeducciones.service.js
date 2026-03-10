import api from './api.js'

// Base: /v1/tipos-deducciones — igual que el backend
const ENDPOINT = '/v1/tipos-deducciones'

export const tiposDeduccionesService = {
  /** @returns {Promise<import('../types').TipoDeduccion[]>} */
  getAll: () => api.get(ENDPOINT).then((r) => r.data),

  /** @param {number} id @returns {Promise<import('../types').TipoDeduccion>} */
  getById: (id) => api.get(`${ENDPOINT}/id/${id}`).then((r) => r.data),

  /** @param {string} nombre @returns {Promise<import('../types').TipoDeduccion>} */
  getByNombre: (nombre) => api.get(`${ENDPOINT}/nombre/${nombre}`).then((r) => r.data),

  /**
   * @param {import('../types').TipoDeduccionPayload} data
   * @returns {Promise<import('../types').TipoDeduccion>}
   */
  create: (data) => api.post(ENDPOINT, data).then((r) => r.data),

  /**
   * El backend espera el id dentro del body
   * @param {import('../types').TipoDeduccionPayload & { id: number }} data
   * @returns {Promise<import('../types').TipoDeduccion>}
   */
  update: (data) => api.put(`${ENDPOINT}/actualizar`, data).then((r) => r.data),

  /**
   * El backend usa PUT para eliminación lógica
   * @param {number} id
   * @returns {Promise<string>}
   */
  remove: (id) => api.put(`${ENDPOINT}/eliminar/${id}`).then((r) => r.data),
}
