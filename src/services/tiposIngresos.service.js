import api from './api.js'

const ENDPOINT = '/tipos-ingresos'

export const tiposIngresosService = {
  /** @returns {Promise<import('../types').TipoIngreso[]>} */
  getAll: () => api.get(ENDPOINT).then((r) => r.data),

  /** @param {number} id @returns {Promise<import('../types').TipoIngreso>} */
  getById: (id) => api.get(`${ENDPOINT}/${id}`).then((r) => r.data),

  /** @param {import('../types').TipoIngresoPayload} data @returns {Promise<import('../types').TipoIngreso>} */
  create: (data) => api.post(ENDPOINT, data).then((r) => r.data),

  /** @param {number} id @param {import('../types').TipoIngresoPayload} data @returns {Promise<import('../types').TipoIngreso>} */
  update: (id, data) => api.put(`${ENDPOINT}/${id}`, data).then((r) => r.data),

  /** @param {number} id @returns {Promise<void>} */
  remove: (id) => api.delete(`${ENDPOINT}/${id}`).then((r) => r.data),
}
