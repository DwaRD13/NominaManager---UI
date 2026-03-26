import api from './api.js'

// Base: /v1/transaccion (singular)
const ENDPOINT = '/v1/transaccion'

/**
 * @typedef {Object} Transaccion
 * @property {number} id
 * @property {string} fecha
 * @property {string} tipo
 * @property {string} nombreEmpleado
 * @property {number} monto
 * @property {string} estado - 'INGRESO' | 'DEDUCCIÓN'
 */

/**
 * @typedef {Object} TransaccionPayload
 * @property {number} [id]
 * @property {string} fecha
 * @property {string} tipo
 * @property {number} idEmpleado
 * @property {number} monto
 * @property {string} estado
 */

export const transaccionesService = {
  /** @returns {Promise<Transaccion[]>} */
  getAll: () => api.get(ENDPOINT).then((r) => r.data),

  /** @param {number} id @returns {Promise<Transaccion>} */
  getById: (id) => api.get(`${ENDPOINT}/${id}`).then((r) => r.data),

  /** @param {TransaccionPayload} data @returns {Promise<Transaccion>} */
  create: (data) => api.post(ENDPOINT, data).then((r) => r.data),

  /** @param {TransaccionPayload & { id: number }} data @returns {Promise<Transaccion>} */
  update: (data) => api.put(`${ENDPOINT}`, data).then((r) => r.data),

  /** @param {number} id @returns {Promise<void>} */
  delete: (id) => api.delete(`${ENDPOINT}/${id}`).then((r) => r.data),
}