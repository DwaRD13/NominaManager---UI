import api from './api.js'

const ENDPOINT = '/tipos-deducciones'

export const tiposDeduccionesService = {
  /** @returns {Promise<import('../types').TipoDeduccion[]>} */
  getAll: () => api.get(ENDPOINT).then((r) => r.data),

  /** @param {number} id @returns {Promise<import('../types').TipoDeduccion>} */
  getById: (id) => api.get(`${ENDPOINT}/${id}`).then((r) => r.data),

  /** @param {import('../types').TipoDeduccionPayload} data @returns {Promise<import('../types').TipoDeduccion>} */
  create: (data) => api.post(ENDPOINT, data).then((r) => r.data),

  /** @param {number} id @param {import('../types').TipoDeduccionPayload} data @returns {Promise<import('../types').TipoDeduccion>} */
  update: (id, data) => api.put(`${ENDPOINT}/${id}`, data).then((r) => r.data),

  /** @param {number} id @returns {Promise<void>} */
  remove: (id) => api.delete(`${ENDPOINT}/${id}`).then((r) => r.data),
}
