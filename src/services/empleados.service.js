import api from './api.js'

const ENDPOINT = '/empleados'

export const empleadosService = {
  /** @returns {Promise<import('../types').Empleado[]>} */
  getAll: () => api.get(ENDPOINT).then((r) => r.data),

  /** @param {number} id @returns {Promise<import('../types').Empleado>} */
  getById: (id) => api.get(`${ENDPOINT}/${id}`).then((r) => r.data),

  /** @param {import('../types').EmpleadoPayload} data @returns {Promise<import('../types').Empleado>} */
  create: (data) => api.post(ENDPOINT, data).then((r) => r.data),

  /** @param {number} id @param {import('../types').EmpleadoPayload} data @returns {Promise<import('../types').Empleado>} */
  update: (id, data) => api.put(`${ENDPOINT}/${id}`, data).then((r) => r.data),

  /** @param {number} id @returns {Promise<void>} */
  remove: (id) => api.delete(`${ENDPOINT}/${id}`).then((r) => r.data),
}
